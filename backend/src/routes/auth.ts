import { Router } from "express";
import { z } from "zod";

import {
  clearAdminSessionCookie,
  requireAdmin,
  setAdminSessionCookie,
  signAdminToken,
  verifyPassword,
} from "../lib/auth.js";
import type { AdminRole } from "../lib/constants.js";
import { prisma } from "../lib/prisma.js";

const router = Router();

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: z.flattenError(parsed.error) });
    return;
  }
  const { email, password } = parsed.data;

  const admin = await prisma.adminUser.findUnique({ where: { email } });
  // Compare against a fixed dummy hash even when no user exists, so login
  // takes roughly the same time either way and doesn't leak which emails
  // are registered via response timing.
  const passwordHash = admin?.passwordHash ?? "$2b$12$invalidsaltinvalidsaltinvalidsalOu6XW4Iu0ipTM6ke0Xz9O";
  const passwordValid = await verifyPassword(password, passwordHash);

  if (!admin || !passwordValid) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const token = signAdminToken({
    sub: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role as AdminRole,
  });
  setAdminSessionCookie(res, token);
  res.json({ admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role } });
});

router.post("/logout", (_req, res) => {
  clearAdminSessionCookie(res);
  res.json({ loggedOut: true });
});

router.get("/me", requireAdmin(), async (req, res) => {
  const admin = await prisma.adminUser.findUnique({ where: { id: req.admin!.sub } });
  if (!admin) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  res.json({ admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role } });
});

export default router;
