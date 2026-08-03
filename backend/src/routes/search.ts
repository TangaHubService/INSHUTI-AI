import { Router } from "express";
import { z } from "zod";

import { requireAdmin } from "../lib/auth.js";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.get("/admin", requireAdmin(), async (req, res) => {
  const parsed = z.object({ q: z.string().trim().min(2).max(100) }).safeParse(req.query);
  if (!parsed.success) { res.status(400).json({ error: "Search must contain at least 2 characters" }); return; }
  const q = parsed.data.q;
  const [users, facilities, articles, professionals, consultations] = await Promise.all([
    prisma.user.findMany({ where: { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] }, select: { id: true, name: true, email: true, role: true, active: true }, take: 20 }),
    prisma.healthFacility.findMany({ where: { OR: [{ name: { contains: q, mode: "insensitive" } }, { district: { contains: q, mode: "insensitive" } }, { sector: { contains: q, mode: "insensitive" } }] }, select: { id: true, name: true, district: true, sector: true, type: true }, take: 20 }),
    prisma.article.findMany({ where: { OR: [{ titleEn: { contains: q, mode: "insensitive" } }, { titleRw: { contains: q, mode: "insensitive" } }, { titleFr: { contains: q, mode: "insensitive" } }, { titleSw: { contains: q, mode: "insensitive" } }] }, select: { id: true, titleEn: true, titleRw: true, titleFr: true, titleSw: true, status: true }, take: 20 }),
    prisma.healthcareProfessional.findMany({ where: { OR: [{ user: { name: { contains: q, mode: "insensitive" } } }, { specialization: { contains: q, mode: "insensitive" } }] }, include: { user: { select: { name: true, email: true } } }, take: 20 }),
    prisma.consultation.findMany({ where: { OR: [{ id: { contains: q, mode: "insensitive" } }, { user: { name: { contains: q, mode: "insensitive" } } }] }, select: { id: true, status: true, priority: true, createdAt: true, user: { select: { name: true } } }, take: 20 }),
  ]);
  res.json({ users, facilities, articles, professionals: professionals.map((p) => ({ id: p.id, name: p.user.name, email: p.user.email, type: p.professionalType, specialization: p.specialization, approvalStatus: p.approvalStatus })), consultations });
});

export default router;
