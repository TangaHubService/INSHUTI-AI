import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAdmin } from "../lib/auth.js";
import { MESSAGE_ROLES } from "../lib/constants.js";
import writeXlsxFile from "write-excel-file/node";
import PDFDocument from "pdfkit";
import { writeAuditLog } from "../lib/auditLog.js";

const router = Router();
const [USER] = MESSAGE_ROLES;

function csvEscape(val: string): string {
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

function toCsv(rows: string[][]): string {
  return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
}

type ReportFormat = "csv" | "xlsx" | "pdf";

async function sendReport(req: { query: Record<string, unknown> }, res: import("express").Response, name: string, rows: string[][]) {
  const format: ReportFormat = req.query.format === "xlsx" || req.query.format === "pdf" ? req.query.format : "csv";
  res.setHeader("Content-Disposition", `attachment; filename="${name}-${Date.now()}.${format}"`);

  if (format === "xlsx") {
    res.type("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    const workbook = writeXlsxFile(rows, {
      sheet: name.slice(0, 31),
      stickyRowsCount: 1,
      columns: rows[0].map(() => ({ width: 22 })),
    });
    res.send(await workbook.toBuffer());
    return;
  }

  if (format === "pdf") {
    res.type("application/pdf");
    const document = new PDFDocument({ margin: 36, size: "A4", layout: "landscape" });
    document.pipe(res);
    document.fontSize(18).text(`INSHUTI — ${name} report`);
    document.moveDown().fontSize(7);
    for (const row of rows) {
      document.text(row.join("  |  "), { ellipsis: true });
      document.moveDown(0.35);
    }
    document.end();
    return;
  }

  res.type("text/csv");
  res.send(toCsv(rows));
}

router.get("/conversations", requireAdmin("CONTENT_REVIEWER"), async (_req, res) => {
  const conversations = await prisma.conversation.findMany({
    orderBy: { createdAt: "desc" },
    include: { messages: { orderBy: { createdAt: "asc" }, include: { flaggedItem: true } } },
  });

  const rows = [["ConversationID", "SessionID", "Language", "CreatedAt", "MessageCount", "FirstUserMessage", "HasFlagged"]];
  for (const c of conversations) {
    const firstUser = c.messages.find((m) => m.role === USER);
    rows.push([
      c.id, c.sessionId, c.language, c.createdAt.toISOString(),
      String(c.messages.length),
      firstUser ? firstUser.content.slice(0, 200) : "",
      String(c.messages.some((m) => m.flaggedItem !== null)),
    ]);
  }

  await sendReport(_req, res, "conversations", rows);
  await writeAuditLog({ action: "REPORT_EXPORTED", entityType: "report", entityId: "conversations", adminId: _req.admin?.sub, adminEmail: _req.admin?.email, details: { format: _req.query.format ?? "csv", rowCount: rows.length - 1 } });
});

router.get("/flagged", requireAdmin("CONTENT_REVIEWER"), async (_req, res) => {
  const items = await prisma.flaggedItem.findMany({
    orderBy: { createdAt: "desc" },
    include: { message: { include: { conversation: true } } },
  });

  const rows = [["FlagID", "Reason", "Status", "CreatedAt", "ResolvedBy", "ResolvedAt", "MessagePreview", "ConversationLanguage"]];
  for (const item of items) {
    rows.push([
      item.id, item.reason, item.status, item.createdAt.toISOString(),
      item.resolvedBy ?? "", item.resolvedAt?.toISOString() ?? "",
      item.message.content.slice(0, 140), item.message.conversation.language,
    ]);
  }

  await sendReport(_req, res, "flagged-items", rows);
  await writeAuditLog({ action: "REPORT_EXPORTED", entityType: "report", entityId: "flagged-items", adminId: _req.admin?.sub, adminEmail: _req.admin?.email, details: { format: _req.query.format ?? "csv", rowCount: rows.length - 1 } });
});

router.get("/appointments", requireAdmin("CONTENT_REVIEWER"), async (_req, res) => {
  const appointments = await prisma.appointment.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true } }, professional: { include: { user: { select: { name: true } } } } },
  });

  const rows = [["AppointmentID", "PatientName", "ProfessionalName", "RequestedTime", "Status", "Notes", "Outcome", "CreatedAt"]];
  for (const a of appointments) {
    rows.push([
      a.id, a.user.name, a.professional.user.name, a.requestedTime.toISOString(),
      a.status, a.notes ?? "", a.outcome ?? "", a.createdAt.toISOString(),
    ]);
  }

  await sendReport(_req, res, "appointments", rows);
  await writeAuditLog({ action: "REPORT_EXPORTED", entityType: "report", entityId: "appointments", adminId: _req.admin?.sub, adminEmail: _req.admin?.email, details: { format: _req.query.format ?? "csv", rowCount: rows.length - 1 } });
});

export default router;
