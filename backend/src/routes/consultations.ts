import { Router } from "express";
import { z } from "zod";

import { prisma } from "../lib/prisma.js";
import { requireUser, type AuthenticatedUserRequest } from "../lib/userAuth.js";
import { routeConsultation, reassignConsultation, escalateConsultation } from "../lib/consultationRouter.js";
import { requireAdmin } from "../lib/auth.js";
import { decryptMessage, encryptMessage, messagePreview } from "../lib/messageCrypto.js";
import { SESSION_COOKIE_NAME } from "../lib/session.js";

const router = Router();

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
  if (conversation.userId && conversation.userId !== req.user!.userId) {
    res.status(403).json({ error: "Not authorized to request support for this conversation" });
    return;
  }
  if (!conversation.userId) {
    const anonymousSession = req.cookies?.[SESSION_COOKIE_NAME];
    if (!anonymousSession || conversation.sessionId !== anonymousSession) {
      res.status(403).json({ error: "Not authorized to request support for this conversation" });
      return;
    }
    await prisma.conversation.update({ where: { id: conversation.id }, data: { userId: req.user!.userId } });
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

  const encryptedContent = encryptMessage(parsed.data.content);
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
  const consultation = await prisma.consultation.findUnique({
    where: { id: req.params.id as string },
    include: {
      user: { select: { id: true, name: true, role: true } },
      professional: { include: { user: { select: { id: true, name: true, role: true } } } },
    },
  });
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
      content: decryptMessage(m.content),
      createdAt: m.createdAt,
      readAt: m.readAt,
      senderId: m.role === "USER" ? consultation.user.id : (consultation.professional?.user.id ?? null),
      senderName: m.role === "USER" ? consultation.user.name : (consultation.professional?.user.name ?? "Professional"),
    })),
  });
});

router.get("/chat-list", requireUser, async (req: AuthenticatedUserRequest, res) => {
  const userId = req.user!.userId;
  const professional = await prisma.healthcareProfessional.findUnique({ where: { userId } });
  const isPro = !!professional;

  const consultations = isPro
    ? await prisma.consultation.findMany({
        where: { professionalId: professional.id },
        orderBy: { updatedAt: "desc" },
        include: {
          user: { select: { id: true, name: true, role: true } },
          conversation: {
            include: {
              messages: {
                orderBy: { createdAt: "desc" },
                take: 1,
              },
            },
          },
        },
      })
    : await prisma.consultation.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        include: {
          professional: { include: { user: { select: { id: true, name: true, role: true } } } },
          conversation: {
            include: {
              messages: {
                orderBy: { createdAt: "desc" },
                take: 1,
              },
            },
          },
        },
      });

  const chatList = await Promise.all(
    consultations.map(async (c) => {
      const cAny = c as unknown as {
        user: { id: string; name: string; role: string };
        professional: { user: { id: string; name: string; role: string } } | null;
      };
      const otherParty = isPro
        ? { id: cAny.user.id, name: cAny.user.name, role: cAny.user.role }
        : cAny.professional
          ? { id: cAny.professional.user.id, name: cAny.professional.user.name, role: cAny.professional.user.role }
          : null;

      const lastMsg = c.conversation.messages[0] ?? null;

      const unreadCount = isPro
        ? await prisma.message.count({
            where: { consultationId: c.id, role: "USER", readAt: null },
          })
        : await prisma.message.count({
            where: { consultationId: c.id, role: "ASSISTANT", readAt: null },
          });

      return {
        id: c.id,
        status: c.status,
        priority: c.priority,
        otherParty,
        lastMessage: lastMsg
          ? { content: messagePreview(lastMsg.content), createdAt: lastMsg.createdAt, role: lastMsg.role }
          : null,
        unreadCount,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      };
    }),
  );

  res.json({ chats: chatList });
});

router.patch("/:id/read", requireUser, async (req: AuthenticatedUserRequest, res) => {
  const userId = req.user!.userId;
  const consultation = await prisma.consultation.findUnique({ where: { id: req.params.id as string } });
  if (!consultation) {
    res.status(404).json({ error: "Consultation not found" });
    return;
  }

  const professional = await prisma.healthcareProfessional.findUnique({ where: { userId } });
  const isUser = consultation.userId === userId;
  const isProfessional = !!professional && consultation.professionalId === professional.id;
  if (!isUser && !isProfessional) {
    res.status(403).json({ error: "Not authorized" });
    return;
  }

  const roleToMark = isUser ? "ASSISTANT" : "USER";
  await prisma.message.updateMany({
    where: { consultationId: consultation.id, role: roleToMark, readAt: null },
    data: { readAt: new Date() },
  });

  res.json({ success: true });
});

export default router;
