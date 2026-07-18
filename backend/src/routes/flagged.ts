import { Router } from "express";
import { z } from "zod";

import { requireAdmin } from "../lib/auth.js";
import { FLAG_STATUSES, flagReasonSchema, flagStatusSchema } from "../lib/constants.js";
import { prisma } from "../lib/prisma.js";

const router = Router();
const [, , RESOLVED] = FLAG_STATUSES; // ["FLAGGED", "PENDING", "RESOLVED"]

router.use(requireAdmin("MODERATOR"));

const listQuerySchema = z.object({
  reason: flagReasonSchema.optional(),
  status: flagStatusSchema.optional(),
});

router.get("/", async (req, res) => {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query", details: z.flattenError(parsed.error) });
    return;
  }
  const { reason, status } = parsed.data;

  const items = await prisma.flaggedItem.findMany({
    where: { reason, status },
    orderBy: { createdAt: "desc" },
    include: { message: { include: { conversation: true, topic: true } } },
  });

  res.json({
    items: items.map((item) => ({
      id: item.id,
      reason: item.reason,
      status: item.status,
      reviewerNotes: item.reviewerNotes,
      resolvedBy: item.resolvedBy,
      resolvedAt: item.resolvedAt,
      createdAt: item.createdAt,
      messagePreview: item.message.content.slice(0, 140),
      topic: item.message.topic
        ? { id: item.message.topic.id, nameEn: item.message.topic.nameEn, nameRw: item.message.topic.nameRw }
        : null,
      conversationLanguage: item.message.conversation.language,
    })),
  });
});

router.get("/:id", async (req, res) => {
  const item = await prisma.flaggedItem.findUnique({
    where: { id: req.params.id },
    include: { message: { include: { conversation: true } } },
  });
  if (!item) {
    res.status(404).json({ error: "Flagged item not found" });
    return;
  }

  // Anonymized: the conversation's sessionId is an opaque, PII-free UUID by
  // design (see lib/session.ts) — nothing here is linked to a real identity.
  const transcript = await prisma.message.findMany({
    where: { conversationId: item.message.conversationId },
    orderBy: { createdAt: "asc" },
  });

  res.json({
    item: {
      id: item.id,
      reason: item.reason,
      status: item.status,
      reviewerNotes: item.reviewerNotes,
      resolvedBy: item.resolvedBy,
      resolvedAt: item.resolvedAt,
      createdAt: item.createdAt,
      flaggedMessageId: item.messageId,
    },
    conversation: {
      id: item.message.conversation.id,
      language: item.message.conversation.language,
      createdAt: item.message.conversation.createdAt,
    },
    transcript: transcript.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      createdAt: m.createdAt,
    })),
  });
});

const updateSchema = z.object({
  reviewerNotes: z.string().optional(),
  status: flagStatusSchema.optional(),
});

router.patch("/:id", async (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: z.flattenError(parsed.error) });
    return;
  }

  const existing = await prisma.flaggedItem.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    res.status(404).json({ error: "Flagged item not found" });
    return;
  }

  const { status, reviewerNotes } = parsed.data;
  const becomingResolved = status === RESOLVED && existing.status !== RESOLVED;

  const item = await prisma.flaggedItem.update({
    where: { id: req.params.id },
    data: {
      ...(reviewerNotes !== undefined ? { reviewerNotes } : {}),
      ...(status ? { status } : {}),
      ...(becomingResolved ? { resolvedBy: req.admin!.email, resolvedAt: new Date() } : {}),
    },
  });
  res.json({ item });
});

export default router;
