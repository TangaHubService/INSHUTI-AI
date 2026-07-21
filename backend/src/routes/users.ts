import { Router } from "express";
import { z } from "zod";
import crypto from "node:crypto";

import { prisma } from "../lib/prisma.js";
import { hashPassword, setUserCookie, clearUserCookie, getUserFromRequest, verifyPassword } from "../lib/userAuth.js";
import { requireUser, type AuthenticatedUserRequest } from "../lib/userAuth.js";
import { notifyUser } from "../lib/notifications.js";
import { decodeNotificationPrefs, encodeNotificationPrefs } from "../lib/notificationPrefs.js";
import { env } from "../lib/env.js";
import {
  USER_ROLES,
  userRoleSchema,
  PROFESSIONAL_TYPES,
  professionalTypeSchema,
  GOV_LEVELS,
  govLevelSchema,
  NOTIFICATION_TYPES,
  NOTIFICATION_CHANNELS,
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

  const { email, phone, password, name, role, preferredLanguage, professionalType, specialization, govLevel, regionName } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ error: "An account with this email already exists" });
    return;
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email, phone, passwordHash, name, role,
      preferredLanguage: preferredLanguage ?? "EN",
      ...(role === "HEALTHCARE_PROFESSIONAL" && professionalType
        ? { healthcareProfessional: { create: { professionalType, specialization: specialization ?? null, approvalStatus: "PENDING" } } }
        : {}),
      ...(role === "GOVERNMENT_USER" && govLevel
        ? { governmentUser: { create: { level: govLevel, regionName: regionName ?? "" } } }
        : {}),
    },
  });

  setUserCookie(res, user.id, role as any);

  await notifyUser({
    userId: user.id,
    type: "REGISTRATION_CONFIRMATION",
    title: "Welcome to Inshuti",
    body: "Your account has been created. We're glad you're here.",
  });

  res.status(201).json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role, preferredLanguage: user.preferredLanguage },
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
  if (!user) {
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

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    const maxAttempts = 5;
    const newAttempts = user.loginAttempts + 1;
    if (newAttempts >= maxAttempts) {
      await prisma.user.update({
        where: { id: user.id },
        data: { loginAttempts: newAttempts, lockedUntil: new Date(Date.now() + 15 * 60 * 1000) },
      });
      res.status(423).json({ error: "Account locked due to too many failed attempts. Try again in 15 minutes." });
      return;
    }
    await prisma.user.update({ where: { id: user.id }, data: { loginAttempts: newAttempts } });
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { loginAttempts: 0, lockedUntil: null, lastActivityAt: new Date() },
  });

  setUserCookie(res, user.id, user.role as any);
  res.json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role, preferredLanguage: user.preferredLanguage },
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
      healthcareProfessional: user.healthcareProfessional ?? null,
      governmentUser: user.governmentUser ?? null,
    },
  });
});

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  phone: z.string().max(30).optional(),
  preferredLanguage: z.enum(["EN", "RW", "FR", "SW"]).optional(),
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

export default router;
