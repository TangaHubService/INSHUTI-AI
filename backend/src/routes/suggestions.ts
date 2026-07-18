import { Router } from "express";

import { MESSAGE_ROLES, languageSchema } from "../lib/constants.js";
import { prisma } from "../lib/prisma.js";
import { getSuggestionsForTopics } from "../lib/suggestions.js";
import { getOrCreateSessionId } from "../lib/session.js";

const router = Router();

const [USER] = MESSAGE_ROLES;

router.get("/", async (req, res) => {
  const sessionId = getOrCreateSessionId(req, res);
  const language = languageSchema.catch("EN").parse(req.query.language);

  const messages = await prisma.message.findMany({
    where: { role: USER, topicId: { not: null }, conversation: { sessionId } },
    include: { topic: true },
  });

  const topicFrequency = new Map<string, number>();
  for (const message of messages) {
    if (!message.topic) continue;
    topicFrequency.set(message.topic.slug, (topicFrequency.get(message.topic.slug) ?? 0) + 1);
  }

  const topicSlugsByFrequency = [...topicFrequency.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([slug]) => slug);

  const suggestions = getSuggestionsForTopics(topicSlugsByFrequency, language);
  res.json({ suggestions });
});

export default router;
