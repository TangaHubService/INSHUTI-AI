import { Router } from "express";
import { z } from "zod";

import { requireAdmin, hashPassword } from "../lib/auth.js";
import { prisma } from "../lib/prisma.js";
import { notifyUser } from "../lib/notifications.js";
import { adminRoleSchema, approvalStatusSchema, userRoleSchema } from "../lib/constants.js";

export const adminUsersRouter = Router();
export const adminAdminsRouter = Router();

adminUsersRouter.use(requireAdmin("SUPER_ADMIN"));
adminAdminsRouter.use(requireAdmin("SUPER_ADMIN"));

const listUsersQuerySchema = z.object({ role: userRoleSchema.optional() });

adminUsersRouter.get("/", async (req, res) => {
  const parsed = listUsersQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query" });
    return;
  }

  const users = await prisma.user.findMany({
    where: { role: parsed.data.role },
    orderBy: { createdAt: "desc" },
    include: { healthcareProfessional: true, governmentUser: true },
  });

  res.json({
    users: users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      active: u.active,
      createdAt: u.createdAt,
      healthcareProfessional: u.healthcareProfessional
        ? { professionalType: u.healthcareProfessional.professionalType, approvalStatus: u.healthcareProfessional.approvalStatus }
        : null,
      governmentUser: u.governmentUser ? { level: u.governmentUser.level, regionName: u.governmentUser.regionName } : null,
    })),
  });
});

adminUsersRouter.patch("/:id", async (req, res) => {
  const parsed = z.object({ active: z.boolean() }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const user = await prisma.user.update({
    where: { id: req.params.id as string },
    data: { active: parsed.data.active },
  }).catch(() => null);

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json({ id: user.id, active: user.active });
});

adminUsersRouter.patch("/:id/approval", async (req, res) => {
  const parsed = z.object({ approvalStatus: approvalStatusSchema }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const professional = await prisma.healthcareProfessional.findUnique({ where: { userId: req.params.id as string } });
  if (!professional) {
    res.status(404).json({ error: "Healthcare professional not found" });
    return;
  }

  const updated = await prisma.healthcareProfessional.update({
    where: { id: professional.id },
    data: { approvalStatus: parsed.data.approvalStatus, approvedBy: req.admin!.email, approvedAt: new Date() },
  });

  await notifyUser({
    userId: req.params.id as string,
    type: "REGISTRATION_CONFIRMATION",
    title: parsed.data.approvalStatus === "APPROVED" ? "Your professional account is approved" : "Your professional account application was reviewed",
    body:
      parsed.data.approvalStatus === "APPROVED"
        ? "You're now approved to receive consultations and appointments."
        : "Your healthcare professional application was not approved. Contact support for details.",
  });

  res.json({ approvalStatus: updated.approvalStatus });
});

adminAdminsRouter.get("/", async (_req, res) => {
  const admins = await prisma.adminUser.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, name: true, role: true, active: true, createdAt: true },
  });
  res.json({ admins });
});

const createAdminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(100),
  role: adminRoleSchema,
});

adminAdminsRouter.post("/", async (req, res) => {
  const parsed = createAdminSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: z.flattenError(parsed.error) });
    return;
  }

  const existing = await prisma.adminUser.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    res.status(409).json({ error: "An admin with this email already exists" });
    return;
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const admin = await prisma.adminUser.create({
    data: { email: parsed.data.email, passwordHash, name: parsed.data.name, role: parsed.data.role },
  });

  res.status(201).json({ id: admin.id, email: admin.email, name: admin.name, role: admin.role, active: admin.active });
});

const updateAdminSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  role: adminRoleSchema.optional(),
  active: z.boolean().optional(),
});

adminAdminsRouter.patch("/:id", async (req, res) => {
  const parsed = updateAdminSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  if (req.params.id === req.admin!.sub && parsed.data.active === false) {
    res.status(400).json({ error: "You cannot deactivate your own account" });
    return;
  }

  const admin = await prisma.adminUser.update({
    where: { id: req.params.id as string },
    data: parsed.data,
  }).catch(() => null);

  if (!admin) {
    res.status(404).json({ error: "Admin not found" });
    return;
  }

  res.json({ id: admin.id, email: admin.email, name: admin.name, role: admin.role, active: admin.active });
});
