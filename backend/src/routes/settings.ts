import { Router } from "express";
import { z } from "zod";

import { requireAdmin } from "../lib/auth.js";
import { prisma } from "../lib/prisma.js";
import { writeAuditLog } from "../lib/auditLog.js";

const router = Router();

router.use(requireAdmin("SUPER_ADMIN"));

router.get("/", async (_req, res) => {
  const settings = await prisma.appSettings.findUnique({ where: { id: "singleton" } });
  res.json({ settings });
});

const updateSettingsSchema = z.object({
  aiProvider: z.string().min(1).optional(),
  aiModel: z.string().min(1).optional(),
  responseStyleNote: z.string().optional(),
  restrictToKnowledgeBase: z.boolean().optional(),
  autoFlagCrisisLanguage: z.boolean().optional(),
  autoDetectLanguage: z.boolean().optional(),
});

router.patch("/", async (req, res) => {
  const parsed = updateSettingsSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: z.flattenError(parsed.error) });
    return;
  }
  const settings = await prisma.appSettings.update({ where: { id: "singleton" }, data: parsed.data });

  await writeAuditLog({
    action: "SETTINGS_UPDATED",
    entityType: "app_settings",
    entityId: "singleton",
    adminId: req.admin!.sub,
    adminEmail: req.admin!.email,
    details: parsed.data,
  });

  res.json({ settings });
});

router.get("/crisis-resources", async (_req, res) => {
  const resources = await prisma.crisisResource.findMany({ orderBy: { order: "asc" } });
  res.json({ resources });
});

const crisisResourceSchema = z.object({
  name: z.string().min(1),
  contact: z.string().min(1),
  region: z.string().min(1),
  order: z.number().int(),
});

router.post("/crisis-resources", async (req, res) => {
  const parsed = crisisResourceSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: z.flattenError(parsed.error) });
    return;
  }
  const resource = await prisma.crisisResource.create({ data: parsed.data });

  await writeAuditLog({
    action: "CRISIS_RESOURCE_CREATED",
    entityType: "crisis_resource",
    entityId: resource.id,
    adminId: req.admin!.sub,
    adminEmail: req.admin!.email,
    details: { name: resource.name },
  });

  res.status(201).json({ resource });
});

const updateCrisisResourceSchema = crisisResourceSchema.partial();

router.patch("/crisis-resources/:id", async (req, res) => {
  const parsed = updateCrisisResourceSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: z.flattenError(parsed.error) });
    return;
  }
  const existing = await prisma.crisisResource.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    res.status(404).json({ error: "Crisis resource not found" });
    return;
  }
  const resource = await prisma.crisisResource.update({ where: { id: req.params.id }, data: parsed.data });

  await writeAuditLog({
    action: "CRISIS_RESOURCE_UPDATED",
    entityType: "crisis_resource",
    entityId: resource.id,
    adminId: req.admin!.sub,
    adminEmail: req.admin!.email,
    details: parsed.data,
  });

  res.json({ resource });
});

router.delete("/crisis-resources/:id", async (req, res) => {
  const existing = await prisma.crisisResource.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    res.status(404).json({ error: "Crisis resource not found" });
    return;
  }
  await prisma.crisisResource.delete({ where: { id: req.params.id } });

  await writeAuditLog({
    action: "CRISIS_RESOURCE_DELETED",
    entityType: "crisis_resource",
    entityId: req.params.id,
    adminId: req.admin!.sub,
    adminEmail: req.admin!.email,
    details: { name: existing.name },
  });

  res.status(204).send();
});

export default router;
