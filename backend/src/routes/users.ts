import { Router } from "express";
import { z } from "zod";

import { prisma } from "../lib/prisma.js";
import { hashPassword, setUserCookie, clearUserCookie, getUserFromRequest, verifyPassword } from "../lib/userAuth.js";
import { USER_ROLES, userRoleSchema, PROFESSIONAL_TYPES, professionalTypeSchema, GOV_LEVELS, govLevelSchema } from "../lib/constants.js";

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

export default router;
