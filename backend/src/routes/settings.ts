import { Router } from "express";
import { z } from "zod";

import { requireAdmin } from "../lib/auth.js";
import { prisma } from "../lib/prisma.js";

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
  res.json({ resource });
});

router.delete("/crisis-resources/:id", async (req, res) => {
  const existing = await prisma.crisisResource.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    res.status(404).json({ error: "Crisis resource not found" });
    return;
  }
  await prisma.crisisResource.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;
