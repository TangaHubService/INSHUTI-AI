import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAdmin } from "../lib/auth.js";

const router = Router();
const startTime = Date.now();
let requestCount = 0;
let errorCount = 0;

export function incrementRequestCounter() {
  requestCount += 1;
}

export function incrementErrorCounter() {
  errorCount += 1;
}

// Internal operational metrics (memory, request/error counters) — admin-only,
// not for public/unauthenticated consumption.
router.get("/health", requireAdmin(), async (_req, res) => {
  let dbStatus = "ok";
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    dbStatus = "error";
  }

  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);

  res.json({
    status: dbStatus === "ok" ? "ok" : "degraded",
    uptime: uptimeSeconds,
    uptimeHuman: formatUptime(uptimeSeconds),
    timestamp: new Date().toISOString(),
    database: dbStatus,
    requestsTotal: requestCount,
    errorsTotal: errorCount,
    memory: process.memoryUsage(),
    nodeVersion: process.version,
    platform: process.platform,
  });
});

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const parts: string[] = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(" ");
}

export default router;
