import { Router } from "express";
import { z } from "zod";
import crypto from "node:crypto";

import { prisma } from "../lib/prisma.js";
import { requireUser, type AuthenticatedUserRequest } from "../lib/userAuth.js";
import { routeConsultation, reassignConsultation, escalateConsultation } from "../lib/consultationRouter.js";
import { requireAdmin } from "../lib/auth.js";
import { FLAG_REASONS } from "../lib/constants.js";

const router = Router();

const ENCRYPTION_KEY = process.env.MESSAGE_ENCRYPTION_KEY ?? "dev-only-32-char-key-default-xxxxx";

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", crypto.createHash("sha256").update(ENCRYPTION_KEY).digest(), iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

function decrypt(text: string): string {
  const parts = text.split(":");
  const iv = Buffer.from(parts[0], "hex");
  const encrypted = Buffer.from(parts[1], "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", crypto.createHash("sha256").update(ENCRYPTION_KEY).digest(), iv);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString("utf8");
}

router.post("/request", requireUser, async (req: AuthenticatedUserRequest, res) => {
  const parsed = z.object({ conversationId: z.string().min(1) }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  const { conversationId } = parsed.data;

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      messages: { take: 1, orderBy: { createdAt: "desc" }, include: { flaggedItem: true } },
    },
  });
  if (!conversation) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }

  const lastMessage = conversation.messages[0];
  const riskFlags = lastMessage?.flaggedItem ? [lastMessage.flaggedItem.reason] : [];

  const lastTopicMsg = await prisma.message.findFirst({
    where: { conversationId, topicId: { not: null } },
    orderBy: { createdAt: "desc" },
    include: { topic: true },
  });

  const result = await routeConsultation({
    conversationId,
    userId: req.user!.userId,
    topicSlug: lastTopicMsg?.topic?.slug,
    riskFlags,
  });

  res.status(201).json(result);
});

router.get("/my", requireUser, async (req: AuthenticatedUserRequest, res) => {
  const consultations = await prisma.consultation.findMany({
    where: { userId: req.user!.userId },
    orderBy: { createdAt: "desc" },
    include: {
      conversation: { select: { id: true, language: true } },
      professional: { include: { user: { select: { name: true } } } },
    },
  });
  res.json({
    consultations: consultations.map((c) => ({
      id: c.id,
      status: c.status,
      priority: c.priority,
      assignedTo: c.professional ? c.professional.user.name : null,
      createdAt: c.createdAt,
    })),
  });
});

router.get("/professional", requireUser, async (req: AuthenticatedUserRequest, res) => {
  const hp = await prisma.healthcareProfessional.findUnique({ where: { userId: req.user!.userId } });
  if (!hp) {
    res.status(403).json({ error: "Not a healthcare professional" });
    return;
  }

  const consultations = await prisma.consultation.findMany({
    where: { professionalId: hp.id },
    orderBy: { createdAt: "desc" },
    include: {
      conversation: { select: { id: true, language: true } },
      user: { select: { name: true } },
    },
  });
  res.json({
    consultations: consultations.map((c) => ({
      id: c.id,
      status: c.status,
      priority: c.priority,
      patientName: c.user.name,
      language: c.conversation.language,
      createdAt: c.createdAt,
    })),
  });
});

router.patch("/:id/reassign", requireAdmin(), async (req, res) => {
  const parsed = z.object({ professionalId: z.string().min(1) }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  await reassignConsultation(req.params.id as string as string, parsed.data.professionalId);
  res.json({ reassigned: true });
});

router.post("/:id/escalate", requireAdmin(), async (req, res) => {
  await escalateConsultation(req.params.id as string as string);
  res.json({ escalated: true });
});

router.post("/:id/messages", requireUser, async (req: AuthenticatedUserRequest, res) => {
  const parsed = z.object({ content: z.string().min(1).max(5000) }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const consultation = await prisma.consultation.findUnique({ where: { id: req.params.id as string } });
  if (!consultation) {
    res.status(404).json({ error: "Consultation not found" });
    return;
  }

  const professional = await prisma.healthcareProfessional.findUnique({ where: { userId: req.user!.userId } });
  const isUser = consultation.userId === req.user!.userId;
  const isProfessional = !!professional && consultation.professionalId === professional.id;
  if (!isUser && !isProfessional) {
    res.status(403).json({ error: "Not authorized" });
    return;
  }

  const encryptedContent = encrypt(parsed.data.content);
  const message = await prisma.message.create({
    data: {
      conversationId: consultation.conversationId,
      consultationId: consultation.id,
      role: isUser ? "USER" : "ASSISTANT",
      content: encryptedContent,
    },
  });

  res.status(201).json({ id: message.id, createdAt: message.createdAt });
});

router.get("/:id/messages", requireUser, async (req: AuthenticatedUserRequest, res) => {
  const consultation = await prisma.consultation.findUnique({ where: { id: req.params.id as string } });
  if (!consultation) {
    res.status(404).json({ error: "Consultation not found" });
    return;
  }

  const professional = await prisma.healthcareProfessional.findUnique({ where: { userId: req.user!.userId } });
  const isUser = consultation.userId === req.user!.userId;
  const isProfessional = !!professional && consultation.professionalId === professional.id;
  if (!isUser && !isProfessional) {
    res.status(403).json({ error: "Not authorized" });
    return;
  }

  const messages = await prisma.message.findMany({
    where: { consultationId: consultation.id },
    orderBy: { createdAt: "asc" },
  });

  res.json({
    messages: messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: decrypt(m.content),
      createdAt: m.createdAt,
    })),
  });
});

export default router;
