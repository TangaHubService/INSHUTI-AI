import { Router } from "express";
import { z } from "zod";

import { ARTICLE_STATUSES } from "../lib/constants.js";
import { decodeJsonColumn } from "../lib/jsonColumn.js";
import { prisma } from "../lib/prisma.js";

const router = Router();
const [REVIEWED] = ARTICLE_STATUSES;

router.get("/topics", async (_req, res) => {
  const topics = await prisma.topic.findMany({
    include: { articles: { where: { status: REVIEWED }, select: { id: true } } },
    orderBy: { nameEn: "asc" },
  });

  res.json({
    topics: topics
      .filter((t) => t.articles.length > 0)
      .map((topic) => ({
        id: topic.id,
        slug: topic.slug,
        nameEn: topic.nameEn,
        nameRw: topic.nameRw,
        nameFr: topic.nameFr,
        nameSw: topic.nameSw,
        icon: topic.icon,
        colorToken: topic.colorToken,
        articleCount: topic.articles.length,
      })),
  });
});

router.get("/articles", async (req, res) => {
  const topicId = typeof req.query.topicId === "string" ? req.query.topicId : undefined;
  const language = z.enum(["EN", "RW", "FR", "SW"]).catch("EN").parse(req.query.language);

  const articles = await prisma.article.findMany({
    where: { status: REVIEWED, ...(topicId ? { topicId } : {}) },
    include: { topic: true },
    orderBy: { updatedAt: "desc" },
  });

  res.json({
    articles: articles.map((a) => ({
      id: a.id,
      topicId: a.topicId,
      topic: { id: a.topic.id, slug: a.topic.slug, nameEn: a.topic.nameEn, nameRw: a.topic.nameRw },
      title: a[`title${language}` as keyof typeof a] as string || a.titleEn,
      body: a[`body${language}` as keyof typeof a] as string || a.bodyEn,
      tags: decodeJsonColumn(a.tags),
      externalUrl: a.externalUrl,
      reviewedAt: a.reviewedAt,
      updatedAt: a.updatedAt,
    })),
  });
});

export default router;
