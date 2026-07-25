import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireUser, type AuthenticatedUserRequest } from "../lib/userAuth.js";
import { requireAdmin } from "../lib/auth.js";
import { MESSAGE_ROLES, LANGUAGES, APPOINTMENT_STATUSES } from "../lib/constants.js";

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

router.get("/conversations", requireAdmin(), async (_req, res) => {
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

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="conversations-${Date.now()}.csv"`);
  res.send(toCsv(rows));
});

router.get("/flagged", requireAdmin(), async (_req, res) => {
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

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="flagged-items-${Date.now()}.csv"`);
  res.send(toCsv(rows));
});

router.get("/appointments", requireAdmin(), async (_req, res) => {
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

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="appointments-${Date.now()}.csv"`);
  res.send(toCsv(rows));
});

export default router;
