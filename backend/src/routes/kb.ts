import { Router } from "express";
import { z } from "zod";

import { requireAdmin } from "../lib/auth.js";
import { ARTICLE_STATUSES, articleStatusSchema } from "../lib/constants.js";
import { decodeJsonColumn, encodeJsonColumn } from "../lib/jsonColumn.js";
import { prisma } from "../lib/prisma.js";

const router = Router();
const [REVIEWED, NEEDS_REVIEW] = ARTICLE_STATUSES; // ["REVIEWED", "NEEDS_REVIEW"]

router.use(requireAdmin("CONTENT_REVIEWER"));

function serializeArticle(article: {
  id: string;
  topicId: string;
  titleEn: string;
  titleRw: string;
  titleFr: string;
  titleSw: string;
  bodyEn: string;
  bodyRw: string;
  bodyFr: string;
  bodySw: string;
  tags: string;
  status: string;
  reviewedBy: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return { ...article, tags: decodeJsonColumn(article.tags) };
}

router.get("/topics", async (_req, res) => {
  const topics = await prisma.topic.findMany({
    include: { articles: { select: { id: true, status: true } } },
    orderBy: { nameEn: "asc" },
  });
  res.json({
    topics: topics.map((topic) => ({
      id: topic.id,
      slug: topic.slug,
      nameEn: topic.nameEn,
      nameRw: topic.nameRw,
      icon: topic.icon,
      colorToken: topic.colorToken,
      articleCount: topic.articles.length,
      reviewedCount: topic.articles.filter((a) => a.status === REVIEWED).length,
    })),
  });
});

router.get("/articles", async (req, res) => {
  const topicId = typeof req.query.topicId === "string" ? req.query.topicId : undefined;
  const articles = await prisma.article.findMany({
    where: topicId ? { topicId } : undefined,
    include: { topic: true },
    orderBy: { updatedAt: "desc" },
  });
  res.json({ articles: articles.map(serializeArticle) });
});

router.get("/articles/:id", async (req, res) => {
  const article = await prisma.article.findUnique({ where: { id: req.params.id } });
  if (!article) {
    res.status(404).json({ error: "Article not found" });
    return;
  }
  res.json({ article: serializeArticle(article) });
});

const createArticleSchema = z.object({
  topicId: z.string().min(1),
  titleEn: z.string().min(1),
  titleRw: z.string().min(1),
  titleFr: z.string().default(""),
  titleSw: z.string().default(""),
  bodyEn: z.string().default(""),
  bodyRw: z.string().default(""),
  bodyFr: z.string().default(""),
  bodySw: z.string().default(""),
  tags: z.array(z.string()).default([]),
});

router.post("/articles", async (req, res) => {
  const parsed = createArticleSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: z.flattenError(parsed.error) });
    return;
  }
  const { tags, ...rest } = parsed.data;
  const article = await prisma.article.create({
    data: { ...rest, tags: encodeJsonColumn(tags), status: NEEDS_REVIEW },
  });
  res.status(201).json({ article: serializeArticle(article) });
});

const updateArticleSchema = z.object({
  titleEn: z.string().min(1).optional(),
  titleRw: z.string().min(1).optional(),
  titleFr: z.string().min(1).optional(),
  titleSw: z.string().min(1).optional(),
  bodyEn: z.string().optional(),
  bodyRw: z.string().optional(),
  bodyFr: z.string().optional(),
  bodySw: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: articleStatusSchema.optional(),
});

router.patch("/articles/:id", async (req, res) => {
  const parsed = updateArticleSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: z.flattenError(parsed.error) });
    return;
  }

  const existing = await prisma.article.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    res.status(404).json({ error: "Article not found" });
    return;
  }

  const { tags, status, ...rest } = parsed.data;
  const mergedBodyEn = rest.bodyEn ?? existing.bodyEn;
  const mergedBodyRw = rest.bodyRw ?? existing.bodyRw;
  const mergedBodyFr = rest.bodyFr ?? existing.bodyFr;
  const mergedBodySw = rest.bodySw ?? existing.bodySw;

  if (status === REVIEWED && (!mergedBodyEn.trim() || !mergedBodyRw.trim() || !mergedBodyFr.trim() || !mergedBodySw.trim())) {
    res.status(400).json({
      error: "Cannot mark REVIEWED: body text must be filled in all 4 languages (EN, RW, FR, SW) first.",
    });
    return;
  }

  const becomingReviewed = status === REVIEWED && existing.status !== REVIEWED;

  const article = await prisma.article.update({
    where: { id: req.params.id },
    data: {
      ...rest,
      ...(tags ? { tags: encodeJsonColumn(tags) } : {}),
      ...(status ? { status } : {}),
      ...(becomingReviewed
        ? { reviewedBy: req.admin!.email, reviewedAt: new Date() }
        : {}),
    },
  });
  res.json({ article: serializeArticle(article) });
});

router.delete("/articles/:id", async (req, res) => {
  const existing = await prisma.article.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    res.status(404).json({ error: "Article not found" });
    return;
  }
  await prisma.article.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;
