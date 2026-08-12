import { Router } from "express";
import { z } from "zod";

import { prisma } from "../lib/prisma.js";
import { decodeJsonColumn } from "../lib/jsonColumn.js";
import { buildDownloadUrl } from "../lib/cloudinary.js";
import { sanitizeFilename } from "../lib/healthEducationFiles.js";
import { serializeAttachment, serializeResource, summarizeResource } from "../lib/healthEducationSerializers.js";

const router = Router();

const sortSchema = z.enum(["newest", "oldest", "alpha"]).catch("newest");

router.get("/", async (req, res) => {
  const search = typeof req.query.search === "string" ? req.query.search.trim() : undefined;
  const category = typeof req.query.category === "string" ? req.query.category : undefined;
  const topic = typeof req.query.topic === "string" ? req.query.topic : undefined;
  const language = typeof req.query.language === "string" ? req.query.language : undefined;
  const fileType = typeof req.query.fileType === "string" ? req.query.fileType.toLowerCase() : undefined;
  const tagsFilter = typeof req.query.tags === "string"
    ? req.query.tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean)
    : [];
  const sort = sortSchema.parse(req.query.sort);
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(60, Math.max(1, Number(req.query.limit) || 12));

  const resources = await prisma.healthEducationResource.findMany({
    where: {
      ...(search ? { title: { contains: search } } : {}),
      ...(category ? { category } : {}),
      ...(topic ? { topic } : {}),
      ...(language ? { language } : {}),
      ...(fileType
        ? { attachments: { some: { OR: [{ fileExtension: fileType }, { resourceType: fileType }] } } }
        : {}),
    },
    include: { attachments: { select: { fileExtension: true } } },
  });

  let summaries = resources.map((r) => summarizeResource(r));

  if (tagsFilter.length > 0) {
    summaries = summaries.filter((r) => r.tags.some((tag) => tagsFilter.includes(tag.toLowerCase())));
  }

  summaries.sort((a, b) => {
    if (sort === "alpha") return a.title.localeCompare(b.title);
    const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    return sort === "oldest" ? diff : -diff;
  });

  const total = summaries.length;
  const start = (page - 1) * limit;
  const pageItems = summaries.slice(start, start + limit);

  res.json({ resources: pageItems, total, page, pageCount: Math.max(1, Math.ceil(total / limit)) });
});

router.get("/filters", async (_req, res) => {
  const resources = await prisma.healthEducationResource.findMany({
    select: { category: true, topic: true, language: true, tags: true, attachments: { select: { fileExtension: true } } },
  });

  const categories = new Set<string>();
  const topics = new Set<string>();
  const languages = new Set<string>();
  const tags = new Set<string>();
  const fileTypes = new Set<string>();

  for (const r of resources) {
    categories.add(r.category);
    topics.add(r.topic);
    languages.add(r.language);
    for (const tag of decodeJsonColumn(r.tags)) tags.add(tag);
    for (const a of r.attachments) fileTypes.add(a.fileExtension.toUpperCase());
  }

  res.json({
    categories: Array.from(categories).sort(),
    topics: Array.from(topics).sort(),
    languages: Array.from(languages).sort(),
    tags: Array.from(tags).sort(),
    fileTypes: Array.from(fileTypes).sort(),
  });
});

router.get("/attachments/:attachmentId/download", async (req, res) => {
  const attachment = await prisma.healthEducationAttachment.findUnique({ where: { id: req.params.attachmentId } });
  if (!attachment) {
    res.status(404).json({ error: "Attachment not found" });
    return;
  }
  const downloadUrl = buildDownloadUrl(
    attachment.publicId,
    attachment.resourceType as "image" | "video" | "raw",
    sanitizeFilename(attachment.originalFileName),
  );
  res.redirect(302, downloadUrl);
});

router.get("/:id", async (req, res) => {
  const resource = await prisma.healthEducationResource.findUnique({
    where: { id: req.params.id },
    include: { attachments: { orderBy: { sortOrder: "asc" } } },
  });
  if (!resource) {
    res.status(404).json({ error: "Resource not found" });
    return;
  }
  res.json({
    resource: { ...serializeResource(resource), attachments: resource.attachments.map(serializeAttachment) },
  });
});

export default router;
