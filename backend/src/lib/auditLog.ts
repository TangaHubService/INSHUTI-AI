import { prisma } from "./prisma.js";

export interface AuditLogEntry {
  action: string;
  entityType: string;
  entityId?: string;
  adminId?: string;
  adminEmail?: string;
  details?: Record<string, unknown>;
}

export async function writeAuditLog(entry: AuditLogEntry): Promise<void> {
  await prisma.auditLog.create({
    data: {
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId ?? null,
      adminId: entry.adminId ?? null,
      adminEmail: entry.adminEmail ?? null,
      details: JSON.stringify(entry.details ?? {}),
    },
  });
}
