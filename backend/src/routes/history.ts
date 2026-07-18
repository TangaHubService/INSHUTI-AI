import { Router } from "express";

import { MESSAGE_ROLES } from "../lib/constants.js";
import { prisma } from "../lib/prisma.js";
import { getOrCreateSessionId, issueNewSessionId } from "../lib/session.js";

const router = Router();

const [USER] = MESSAGE_ROLES;
const HISTORY_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

router.get("/", async (req, res) => {
  const sessionId = getOrCreateSessionId(req, res);
  const since = new Date(Date.now() - HISTORY_WINDOW_MS);

  const conversations = await prisma.conversation.findMany({
    where: { sessionId, createdAt: { gte: since } },
    orderBy: { createdAt: "desc" },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        include: { topic: true },
      },
    },
  });

  const conversationSummaries = conversations.map((conversation) => {
    const firstUserMessage = conversation.messages.find((m) => m.role === USER) ?? null;
    const topicSource = conversation.messages.find((m) => m.topic)?.topic ?? null;
    return {
      id: conversation.id,
      createdAt: conversation.createdAt,
      language: conversation.language,
      firstUserMessage: firstUserMessage?.content ?? null,
      topic: topicSource
        ? {
            id: topicSource.id,
            slug: topicSource.slug,
            nameEn: topicSource.nameEn,
            nameRw: topicSource.nameRw,
            icon: topicSource.icon,
            colorToken: topicSource.colorToken,
          }
        : null,
    };
  });

  const topicCountMap = new Map<string, { topic: (typeof conversations)[number]["messages"][number]["topic"]; count: number }>();
  for (const conversation of conversations) {
    for (const message of conversation.messages) {
      if (message.role !== USER || !message.topic) continue;
      const existing = topicCountMap.get(message.topic.id);
      if (existing) {
        existing.count += 1;
      } else {
        topicCountMap.set(message.topic.id, { topic: message.topic, count: 1 });
      }
    }
  }

  const topicCounts = [...topicCountMap.values()]
    .sort((a, b) => b.count - a.count)
    .map(({ topic, count }) => ({
      topic: topic
        ? { id: topic.id, slug: topic.slug, nameEn: topic.nameEn, nameRw: topic.nameRw, colorToken: topic.colorToken }
        : null,
      count,
    }));

  res.json({ conversations: conversationSummaries, topicCounts });
});

router.delete("/", async (req, res) => {
  const sessionId = getOrCreateSessionId(req, res);

  await prisma.$transaction([
    prisma.flaggedItem.deleteMany({ where: { message: { conversation: { sessionId } } } }),
    prisma.message.deleteMany({ where: { conversation: { sessionId } } }),
    prisma.conversation.deleteMany({ where: { sessionId } }),
  ]);

  issueNewSessionId(res);
  res.json({ cleared: true });
});

export default router;
