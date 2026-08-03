import { prisma } from "./prisma.js";
import crypto from "node:crypto";

export interface AuditLogEntry {
  action: string;
  entityType: string;
  entityId?: string;
  adminId?: string;
  adminEmail?: string;
  details?: Record<string, unknown>;
}

export async function writeAuditLog(entry: AuditLogEntry): Promise<void> {
  const previous = await prisma.auditLog.findFirst({ orderBy: { createdAt: "desc" }, select: { hash: true } });
  const previousHash = previous?.hash ?? "GENESIS";
  const createdAt = new Date();
  const details = JSON.stringify(entry.details ?? {});
  const hash = crypto.createHash("sha256").update(JSON.stringify({ previousHash, createdAt: createdAt.toISOString(), action: entry.action, entityType: entry.entityType, entityId: entry.entityId ?? null, adminId: entry.adminId ?? null, adminEmail: entry.adminEmail ?? null, details })).digest("hex");
  await prisma.auditLog.create({
    data: {
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId ?? null,
      adminId: entry.adminId ?? null,
      adminEmail: entry.adminEmail ?? null,
      details,
      previousHash,
      hash,
      createdAt,
    },
  });
}
