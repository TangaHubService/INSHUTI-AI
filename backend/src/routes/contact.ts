import { Router } from "express";
import { z } from "zod";

import { prisma } from "../lib/prisma.js";
import { requireAdmin } from "../lib/auth.js";

const router = Router();

const inquirySchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().email(),
  message: z.string().trim().min(1).max(5000),
});

router.post("/", async (req, res) => {
  const parsed = inquirySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: z.flattenError(parsed.error) });
    return;
  }

  const inquiry = await prisma.contactInquiry.create({ data: parsed.data });

  res.status(201).json({ inquiry: { id: inquiry.id, createdAt: inquiry.createdAt } });
});

router.get("/", requireAdmin("MODERATOR"), async (req, res) => {
  const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10));
  const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit ?? "50"), 10)));
  const skip = (page - 1) * limit;

  const [inquiries, total] = await Promise.all([
    prisma.contactInquiry.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.contactInquiry.count(),
  ]);

  res.json({
    inquiries: inquiries.map((i) => ({
      id: i.id,
      name: i.name,
      email: i.email,
      message: i.message,
      read: i.read,
      createdAt: i.createdAt,
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

router.patch("/:id/read", requireAdmin("MODERATOR"), async (req, res) => {
  const id = String(req.params.id);
  const inquiry = await prisma.contactInquiry.findUnique({ where: { id } });
  if (!inquiry) {
    res.status(404).json({ error: "Inquiry not found" });
    return;
  }

  await prisma.contactInquiry.update({ where: { id }, data: { read: true } });
  res.json({ ok: true });
});

export default router;
