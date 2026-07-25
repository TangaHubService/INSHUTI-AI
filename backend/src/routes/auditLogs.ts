import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAdmin } from "../lib/auth.js";

const router = Router();

router.use(requireAdmin("SUPER_ADMIN"));

router.get("/", async (req, res) => {
  const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10));
  const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit ?? "50"), 10)));
  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.auditLog.count(),
  ]);

  res.json({
    logs: logs.map((l: { id: string; action: string; entityType: string; entityId: string | null; adminId: string | null; adminEmail: string | null; details: string; createdAt: Date }) => ({ ...l, details: JSON.parse(l.details) })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

export default router;
