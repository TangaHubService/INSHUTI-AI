import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAdmin } from "../lib/auth.js";
import crypto from "node:crypto";

const router = Router();

router.use(requireAdmin("SUPER_ADMIN"));

router.get("/verify", async (_req, res) => {
  const logs = await prisma.auditLog.findMany({ orderBy: { createdAt: "asc" } });
  let previousHash = "GENESIS";
  for (const log of logs) {
    // Older pre-chain records are reported rather than silently accepted.
    if (!log.hash || log.previousHash !== previousHash) { res.json({ valid: false, failedAt: log.id }); return; }
    const expected = crypto.createHash("sha256").update(JSON.stringify({ previousHash, createdAt: log.createdAt.toISOString(), action: log.action, entityType: log.entityType, entityId: log.entityId, adminId: log.adminId, adminEmail: log.adminEmail, details: log.details })).digest("hex");
    if (expected !== log.hash) { res.json({ valid: false, failedAt: log.id }); return; }
    previousHash = log.hash;
  }
  res.json({ valid: true, count: logs.length, head: previousHash });
});

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
    logs: logs.map((l) => ({ ...l, details: JSON.parse(l.details) })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

export default router;
