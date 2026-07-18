import { Router } from "express";

import { requireAdmin } from "../lib/auth.js";
import { FLAG_STATUSES, LANGUAGES, MESSAGE_ROLES } from "../lib/constants.js";
import { prisma } from "../lib/prisma.js";

const router = Router();
const [USER] = MESSAGE_ROLES;
const [FLAGGED] = FLAG_STATUSES;

router.get("/", requireAdmin(), async (_req, res) => {
  const [totalConversations, distinctSessions, flaggedCount, languageCounts, topicMessages] = await Promise.all([
    prisma.conversation.count(),
    prisma.conversation.findMany({ distinct: ["sessionId"], select: { sessionId: true } }),
    prisma.flaggedItem.count({ where: { status: FLAGGED } }),
    Promise.all(LANGUAGES.map((language) => prisma.conversation.count({ where: { language } }))),
    prisma.message.findMany({
      where: { role: USER, topicId: { not: null } },
      include: { topic: true },
    }),
  ]);

  const languageSplit = Object.fromEntries(LANGUAGES.map((language, i) => [language, languageCounts[i]]));

  const topicEngagement = new Map<string, { topic: NonNullable<(typeof topicMessages)[number]["topic"]>; count: number }>();
  for (const message of topicMessages) {
    if (!message.topic) continue;
    const existing = topicEngagement.get(message.topic.id);
    if (existing) {
      existing.count += 1;
    } else {
      topicEngagement.set(message.topic.id, { topic: message.topic, count: 1 });
    }
  }
  const topicEngagementList = [...topicEngagement.values()]
    .sort((a, b) => b.count - a.count)
    .map(({ topic, count }) => ({
      topic: { id: topic.id, slug: topic.slug, nameEn: topic.nameEn, nameRw: topic.nameRw, colorToken: topic.colorToken },
      count,
    }));

  res.json({
    totalConversations,
    totalSessions: distinctSessions.length,
    mostAskedTopic: topicEngagementList[0]?.topic ?? null,
    flaggedCount,
    languageSplit,
    topicEngagement: topicEngagementList,
  });
});

export default router;
