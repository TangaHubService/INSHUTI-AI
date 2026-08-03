import { Router } from "express";
import { z } from "zod";
import crypto from "node:crypto";

import { prisma } from "../lib/prisma.js";
import { hashPassword, setUserCookie, clearUserCookie, getUserFromRequest, verifyPassword } from "../lib/userAuth.js";
import { requireUser, type AuthenticatedUserRequest } from "../lib/userAuth.js";
import { notifyUser } from "../lib/notifications.js";
import { decodeNotificationPrefs, encodeNotificationPrefs } from "../lib/notificationPrefs.js";
import { env } from "../lib/env.js";
import { writeAuditLog } from "../lib/auditLog.js";
import {
  userRoleSchema,
  professionalTypeSchema,
  govLevelSchema,
  NOTIFICATION_TYPES,
  NOTIFICATION_CHANNELS,
  type UserRole,
} from "../lib/constants.js";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(100),
  role: userRoleSchema,
  preferredLanguage: z.enum(["EN", "RW", "FR", "SW"]).optional(),
  province: z.string().trim().max(100).optional(),
  district: z.string().trim().max(100).optional(),
  sector: z.string().trim().max(100).optional(),
  cell: z.string().trim().max(100).optional(),
  professionalType: professionalTypeSchema.optional(),
  specialization: z.string().optional(),
  govLevel: govLevelSchema.optional(),
  regionName: z.string().optional(),
});

router.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: z.flattenError(parsed.error) });
    return;
  }

  const { email, phone, password, name, role, preferredLanguage, professionalType, specialization, govLevel, regionName, province, district, sector, cell } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ error: "An account with this email already exists" });
    return;
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email, phone, passwordHash, name, role,
      preferredLanguage: preferredLanguage ?? "EN", province, district, sector, cell,
      ...(role === "HEALTHCARE_PROFESSIONAL" && professionalType
        ? { healthcareProfessional: { create: { professionalType, specialization: specialization ?? null, approvalStatus: "PENDING" } } }
        : {}),
      ...(role === "GOVERNMENT_USER" && govLevel
        ? { governmentUser: { create: { level: govLevel, regionName: regionName ?? "" } } }
        : {}),
    },
  });

  setUserCookie(res, user.id, role);

  await notifyUser({
    userId: user.id,
    type: "REGISTRATION_CONFIRMATION",
    title: "Welcome to Inshuti",
    body: "Your account has been created. We're glad you're here.",
  });

  res.status(201).json({
    user: { id: user.id, email: user.email, phone: user.phone, name: user.name, role: user.role, preferredLanguage: user.preferredLanguage, province: user.province, district: user.district, sector: user.sector, cell: user.cell },
  });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: z.flattenError(parsed.error) });
    return;
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  const passwordHash = user?.passwordHash ?? "$2b$12$invalidsaltinvalidsaltinvalidsalOu6XW4Iu0ipTM6ke0Xz9O";
  const valid = await verifyPassword(password, passwordHash);
  if (!user || !valid) {
    if (user) {
      const maxAttempts = 5;
      const newAttempts = user.loginAttempts + 1;
      await prisma.user.update({ where: { id: user.id }, data: newAttempts >= maxAttempts ? { loginAttempts: newAttempts, lockedUntil: new Date(Date.now() + 15 * 60 * 1000) } : { loginAttempts: newAttempts } });
    }
    await writeAuditLog({ action: "USER_LOGIN_FAILED", entityType: "security", entityId: hashToken(email.toLowerCase()), details: { ip: req.ip } });
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const remainingMin = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
    res.status(423).json({ error: `Account is locked. Try again in ${remainingMin} minute(s).` });
    return;
  }

  if (!user.active) {
    res.status(403).json({ error: "This account has been deactivated. Contact an administrator." });
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { loginAttempts: 0, lockedUntil: null, lastActivityAt: new Date() },
  });

  setUserCookie(res, user.id, user.role as UserRole);
  await writeAuditLog({ action: "USER_LOGIN_SUCCEEDED", entityType: "security", entityId: user.id, details: { ip: req.ip } });
  res.json({
    user: { id: user.id, email: user.email, phone: user.phone, name: user.name, role: user.role, preferredLanguage: user.preferredLanguage, province: user.province, district: user.district, sector: user.sector, cell: user.cell },
  });
});

router.post("/logout", (_req, res) => {
  clearUserCookie(res);
  res.json({ loggedOut: true });
});

router.get("/me", async (req, res) => {
  const session = getUserFromRequest(req);
  if (!session) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { healthcareProfessional: true, governmentUser: true },
  });
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }
  if (!user.active) {
    clearUserCookie(res);
    res.status(403).json({ error: "This account has been deactivated. Contact an administrator." });
    return;
  }

  await prisma.user.update({ where: { id: user.id }, data: { lastActivityAt: new Date() } });

  res.json({
    user: {
      id: user.id, email: user.email, phone: user.phone, name: user.name,
      role: user.role, preferredLanguage: user.preferredLanguage,
      province: user.province, district: user.district, sector: user.sector, cell: user.cell,
      healthcareProfessional: user.healthcareProfessional ?? null,
      governmentUser: user.governmentUser ?? null,
    },
  });
});

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  phone: z.string().max(30).optional(),
  preferredLanguage: z.enum(["EN", "RW", "FR", "SW"]).optional(),
  province: z.string().trim().max(100).nullable().optional(),
  district: z.string().trim().max(100).nullable().optional(),
  sector: z.string().trim().max(100).nullable().optional(),
  cell: z.string().trim().max(100).nullable().optional(),
});

router.patch("/me", requireUser, async (req: AuthenticatedUserRequest, res) => {
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: z.flattenError(parsed.error) });
    return;
  }

  const user = await prisma.user.update({ where: { id: req.user!.userId }, data: parsed.data });

  res.json({
    user: {
      id: user.id, email: user.email, phone: user.phone, name: user.name,
      role: user.role, preferredLanguage: user.preferredLanguage,
      province: user.province, district: user.district, sector: user.sector, cell: user.cell,
    },
  });
});

const forgotPasswordSchema = z.object({ email: z.string().email() });

router.post("/forgot-password", async (req, res) => {
  const parsed = forgotPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  // Always respond 200 regardless of whether the account exists, so this
  // endpoint can't be used to enumerate registered emails.
  if (!user) {
    res.json({ sent: true });
    return;
  }

  const token = crypto.randomBytes(32).toString("hex");
  await prisma.user.update({
    where: { id: user.id },
    data: { resetTokenHash: hashToken(token), resetTokenExpiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS) },
  });

  await notifyUser({
    userId: user.id,
    type: "PASSWORD_RESET",
    title: "Reset your Inshuti password",
    body: `Use this link to reset your password (expires in 1 hour): ${env.NEXT_PUBLIC_APP_URL}/reset-password?email=${encodeURIComponent(user.email)}&token=${token}`,
  });

  res.json({ sent: true });
});

const resetPasswordSchema = z.object({
  email: z.string().email(),
  token: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});

router.post("/reset-password", async (req, res) => {
  const parsed = resetPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: z.flattenError(parsed.error) });
    return;
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (
    !user ||
    !user.resetTokenHash ||
    !user.resetTokenExpiresAt ||
    user.resetTokenExpiresAt < new Date() ||
    user.resetTokenHash !== hashToken(parsed.data.token)
  ) {
    res.status(400).json({ error: "Invalid or expired reset link" });
    return;
  }

  const passwordHash = await hashPassword(parsed.data.newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, resetTokenHash: null, resetTokenExpiresAt: null, loginAttempts: 0, lockedUntil: null },
  });

  res.json({ reset: true });
});

router.get("/me/notification-prefs", requireUser, async (req: AuthenticatedUserRequest, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json({ prefs: decodeNotificationPrefs(user.notificationPrefs), types: NOTIFICATION_TYPES, channels: NOTIFICATION_CHANNELS });
});

const prefsSchema = z.object({
  prefs: z.partialRecord(z.enum(NOTIFICATION_TYPES), z.partialRecord(z.enum(NOTIFICATION_CHANNELS), z.boolean())),
});

router.put("/me/notification-prefs", requireUser, async (req: AuthenticatedUserRequest, res) => {
  const parsed = prefsSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: z.flattenError(parsed.error) });
    return;
  }

  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const current = decodeNotificationPrefs(user.notificationPrefs);
  const merged = { ...current, ...parsed.data.prefs } as typeof current;
  for (const type of Object.keys(parsed.data.prefs) as (keyof typeof current)[]) {
    merged[type] = { ...current[type], ...parsed.data.prefs[type] };
  }

  await prisma.user.update({ where: { id: user.id }, data: { notificationPrefs: encodeNotificationPrefs(merged) } });
  res.json({ prefs: merged });
});

router.delete("/me", requireUser, async (req: AuthenticatedUserRequest, res) => {
  const parsed = z.object({ password: z.string().min(1) }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Password is required" });
    return;
  }
  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    res.status(401).json({ error: "Incorrect password" });
    return;
  }
  const unusablePasswordHash = await hashPassword(crypto.randomBytes(32).toString("hex"));
  await prisma.$transaction([
    prisma.notification.deleteMany({ where: { userId: user.id } }),
    prisma.pushSubscription.deleteMany({ where: { userId: user.id } }),
    prisma.user.update({
      where: { id: user.id },
      data: {
        active: false,
        email: `deactivated-${user.id}@deleted.invalid`,
        passwordHash: unusablePasswordHash,
        name: "Deactivated user",
        phone: null,
        province: null,
        district: null,
        sector: null,
        cell: null,
        notificationPrefs: "{}",
        resetTokenHash: null,
        resetTokenExpiresAt: null,
      },
    }),
  ]);
  clearUserCookie(res);
  res.json({ deactivated: true });
});

export default router;
