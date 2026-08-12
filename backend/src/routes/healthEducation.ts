import { Router, type NextFunction, type Request, type RequestHandler, type Response } from "express";
import multer from "multer";
import { z } from "zod";

import { requireAdmin } from "../lib/auth.js";
import { writeAuditLog } from "../lib/auditLog.js";
import { languageSchema } from "../lib/constants.js";
import { encodeJsonColumn } from "../lib/jsonColumn.js";
import { prisma } from "../lib/prisma.js";
import { env } from "../lib/env.js";
import {
  buildCloudinaryFolder,
  deleteFromCloudinary,
  uploadBufferToCloudinary,
} from "../lib/cloudinary.js";
import { isAllowedImageExtension, resolveFileTypeInfo, sanitizeFilename } from "../lib/healthEducationFiles.js";
import { serializeAttachment, serializeResource, summarizeResource } from "../lib/healthEducationSerializers.js";

const router = Router();
router.use(requireAdmin("CONTENT_REVIEWER"));

// --- Multer (memory only — attachments are never written to local disk) ---

const attachmentUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.HEALTH_ED_MAX_ATTACHMENT_SIZE_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const resolved = resolveFileTypeInfo(file.originalname, file.mimetype);
    if (!resolved) {
      cb(new Error("File type not allowed"));
      return;
    }
    cb(null, true);
  },
});

const thumbnailUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.HEALTH_ED_MAX_THUMBNAIL_SIZE_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!isAllowedImageExtension(file.originalname)) {
      cb(new Error("Thumbnail must be an image"));
      return;
    }
    cb(null, true);
  },
});

// Wraps a Multer single-file middleware so validation/size failures resolve
// as a clean 400 instead of falling through to the generic 500 handler.
function upload(middleware: RequestHandler) {
  return (req: Request, res: Response, next: NextFunction) => {
    middleware(req, res, (err: unknown) => {
      if (err instanceof multer.MulterError) {
        res.status(400).json({ error: err.code === "LIMIT_FILE_SIZE" ? "File is too large" : err.message });
        return;
      }
      if (err) {
        res.status(400).json({ error: err instanceof Error ? err.message : "Upload rejected" });
        return;
      }
      next();
    });
  };
}

// --- Resource CRUD ---

router.get("/resources", async (req, res) => {
  const search = typeof req.query.search === "string" ? req.query.search.trim() : undefined;
  const category = typeof req.query.category === "string" ? req.query.category : undefined;
  const topic = typeof req.query.topic === "string" ? req.query.topic : undefined;
  const language = typeof req.query.language === "string" ? req.query.language : undefined;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 25));

  const where = {
    ...(search ? { title: { contains: search } } : {}),
    ...(category ? { category } : {}),
    ...(topic ? { topic } : {}),
    ...(language ? { language } : {}),
  };

  const [resources, total] = await Promise.all([
    prisma.healthEducationResource.findMany({
      where,
      include: { attachments: { select: { fileExtension: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.healthEducationResource.count({ where }),
  ]);

  res.json({
    resources: resources.map((r) => summarizeResource(r)),
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / limit)),
  });
});

router.get("/resources/:id", async (req, res) => {
  const resource = await prisma.healthEducationResource.findUnique({
    where: { id: String(req.params.id) },
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

const createResourceSchema = z.object({
  title: z.string().min(1).max(300),
  shortDescription: z.string().min(1).max(500),
  fullDescription: z.string().min(1),
  category: z.string().min(1).max(120),
  topic: z.string().min(1).max(120),
  targetAudience: z.string().min(1).max(200),
  language: languageSchema.default("EN"),
  tags: z.array(z.string().min(1)).default([]),
  author: z.string().min(1).max(200),
  publishedDate: z.coerce.date(),
});

router.post("/resources", async (req, res) => {
  const parsed = createResourceSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: z.flattenError(parsed.error) });
    return;
  }
  const { tags, ...rest } = parsed.data;
  const resource = await prisma.healthEducationResource.create({
    data: { ...rest, tags: encodeJsonColumn(tags), createdBy: req.admin!.sub },
  });

  await writeAuditLog({
    action: "HEALTH_EDUCATION_RESOURCE_CREATED",
    entityType: "healthEducationResource",
    entityId: resource.id,
    adminId: req.admin!.sub,
    adminEmail: req.admin!.email,
    details: { title: resource.title },
  });

  res.status(201).json({ resource: { ...serializeResource(resource), attachments: [] } });
});

const updateResourceSchema = createResourceSchema.partial();

router.patch("/resources/:id", async (req, res) => {
  const parsed = updateResourceSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: z.flattenError(parsed.error) });
    return;
  }
  const existing = await prisma.healthEducationResource.findUnique({ where: { id: String(req.params.id) } });
  if (!existing) {
    res.status(404).json({ error: "Resource not found" });
    return;
  }

  const { tags, ...rest } = parsed.data;
  const resource = await prisma.healthEducationResource.update({
    where: { id: String(req.params.id) },
    data: { ...rest, ...(tags ? { tags: encodeJsonColumn(tags) } : {}) },
  });

  await writeAuditLog({
    action: "HEALTH_EDUCATION_RESOURCE_UPDATED",
    entityType: "healthEducationResource",
    entityId: resource.id,
    adminId: req.admin!.sub,
    adminEmail: req.admin!.email,
    details: { title: resource.title },
  });

  res.json({ resource: serializeResource(resource) });
});

router.delete("/resources/:id", async (req, res) => {
  const existing = await prisma.healthEducationResource.findUnique({
    where: { id: String(req.params.id) },
    include: { attachments: true },
  });
  if (!existing) {
    res.status(404).json({ error: "Resource not found" });
    return;
  }

  const deletions: Promise<void>[] = existing.attachments.map((a) =>
    deleteFromCloudinary(a.publicId, a.resourceType as "image" | "video" | "raw"),
  );
  if (existing.thumbnailPublicId) {
    deletions.push(deleteFromCloudinary(existing.thumbnailPublicId, "image"));
  }
  await Promise.allSettled(deletions);

  await prisma.healthEducationResource.delete({ where: { id: String(req.params.id) } });

  await writeAuditLog({
    action: "HEALTH_EDUCATION_RESOURCE_DELETED",
    entityType: "healthEducationResource",
    entityId: String(req.params.id),
    adminId: req.admin!.sub,
    adminEmail: req.admin!.email,
    details: { title: existing.title },
  });

  res.status(204).send();
});

// --- Thumbnail ---

router.post("/resources/:id/thumbnail", upload(thumbnailUpload.single("thumbnail")), async (req, res) => {
  const existing = await prisma.healthEducationResource.findUnique({ where: { id: String(req.params.id) } });
  if (!existing) {
    res.status(404).json({ error: "Resource not found" });
    return;
  }
  if (!req.file) {
    res.status(400).json({ error: "No thumbnail provided" });
    return;
  }

  const resolved = resolveFileTypeInfo(req.file.originalname, req.file.mimetype);
  if (!resolved || resolved.cloudinaryResourceType !== "image") {
    res.status(400).json({ error: "Thumbnail must be an image" });
    return;
  }

  const uploaded = await uploadBufferToCloudinary(req.file.buffer, {
    folder: buildCloudinaryFolder(existing.id, "images"),
    filenameForId: sanitizeFilename(req.file.originalname),
    extension: resolved.extension,
    resourceType: "image",
  });

  const previousPublicId = existing.thumbnailPublicId;

  const resource = await prisma.healthEducationResource.update({
    where: { id: existing.id },
    data: {
      thumbnailUrl: uploaded.url,
      thumbnailSecureUrl: uploaded.secureUrl,
      thumbnailPublicId: uploaded.publicId,
    },
  });

  if (previousPublicId) {
    await deleteFromCloudinary(previousPublicId, "image");
  }

  await writeAuditLog({
    action: "HEALTH_EDUCATION_THUMBNAIL_UPLOADED",
    entityType: "healthEducationResource",
    entityId: resource.id,
    adminId: req.admin!.sub,
    adminEmail: req.admin!.email,
  });

  res.status(201).json({ resource: serializeResource(resource) });
});

router.delete("/resources/:id/thumbnail", async (req, res) => {
  const existing = await prisma.healthEducationResource.findUnique({ where: { id: String(req.params.id) } });
  if (!existing) {
    res.status(404).json({ error: "Resource not found" });
    return;
  }
  if (existing.thumbnailPublicId) {
    await deleteFromCloudinary(existing.thumbnailPublicId, "image");
  }
  const resource = await prisma.healthEducationResource.update({
    where: { id: existing.id },
    data: { thumbnailUrl: null, thumbnailSecureUrl: null, thumbnailPublicId: null },
  });
  res.json({ resource: serializeResource(resource) });
});

// --- Attachments ---

router.post("/resources/:id/attachments", upload(attachmentUpload.single("file")), async (req, res) => {
  const existing = await prisma.healthEducationResource.findUnique({ where: { id: String(req.params.id) } });
  if (!existing) {
    res.status(404).json({ error: "Resource not found" });
    return;
  }
  if (!req.file) {
    res.status(400).json({ error: "No file provided" });
    return;
  }

  const resolved = resolveFileTypeInfo(req.file.originalname, req.file.mimetype);
  if (!resolved) {
    res.status(400).json({ error: "File type not allowed" });
    return;
  }

  const sanitized = sanitizeFilename(req.file.originalname);
  const uploaded = await uploadBufferToCloudinary(req.file.buffer, {
    folder: buildCloudinaryFolder(existing.id, resolved.folderCategory),
    filenameForId: sanitized,
    extension: resolved.extension,
    resourceType: resolved.cloudinaryResourceType,
  });

  const maxOrder = await prisma.healthEducationAttachment.aggregate({
    where: { resourceId: existing.id },
    _max: { sortOrder: true },
  });

  const attachment = await prisma.healthEducationAttachment.create({
    data: {
      resourceId: existing.id,
      originalFileName: req.file.originalname,
      fileName: sanitized,
      fileUrl: uploaded.url,
      secureUrl: uploaded.secureUrl,
      publicId: uploaded.publicId,
      mimeType: req.file.mimetype,
      fileExtension: resolved.extension,
      fileSize: req.file.size,
      resourceType: uploaded.resourceType,
      sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
      uploadedBy: req.admin!.sub,
    },
  });

  await writeAuditLog({
    action: "HEALTH_EDUCATION_ATTACHMENT_UPLOADED",
    entityType: "healthEducationAttachment",
    entityId: attachment.id,
    adminId: req.admin!.sub,
    adminEmail: req.admin!.email,
    details: { resourceId: existing.id, originalFileName: attachment.originalFileName },
  });

  res.status(201).json({ attachment: serializeAttachment(attachment) });
});

router.delete("/attachments/:attachmentId", async (req, res) => {
  const attachment = await prisma.healthEducationAttachment.findUnique({ where: { id: String(req.params.attachmentId) } });
  if (!attachment) {
    res.status(404).json({ error: "Attachment not found" });
    return;
  }

  await deleteFromCloudinary(attachment.publicId, attachment.resourceType as "image" | "video" | "raw");
  await prisma.healthEducationAttachment.delete({ where: { id: attachment.id } });

  await writeAuditLog({
    action: "HEALTH_EDUCATION_ATTACHMENT_DELETED",
    entityType: "healthEducationAttachment",
    entityId: attachment.id,
    adminId: req.admin!.sub,
    adminEmail: req.admin!.email,
    details: { resourceId: attachment.resourceId, originalFileName: attachment.originalFileName },
  });

  res.status(204).send();
});

router.put("/attachments/:attachmentId/replace", upload(attachmentUpload.single("file")), async (req, res) => {
  const existing = await prisma.healthEducationAttachment.findUnique({ where: { id: String(req.params.attachmentId) } });
  if (!existing) {
    res.status(404).json({ error: "Attachment not found" });
    return;
  }
  if (!req.file) {
    res.status(400).json({ error: "No file provided" });
    return;
  }

  const resolved = resolveFileTypeInfo(req.file.originalname, req.file.mimetype);
  if (!resolved) {
    res.status(400).json({ error: "File type not allowed" });
    return;
  }

  const sanitized = sanitizeFilename(req.file.originalname);
  const uploaded = await uploadBufferToCloudinary(req.file.buffer, {
    folder: buildCloudinaryFolder(existing.resourceId, resolved.folderCategory),
    filenameForId: sanitized,
    extension: resolved.extension,
    resourceType: resolved.cloudinaryResourceType,
  });

  const attachment = await prisma.healthEducationAttachment.update({
    where: { id: existing.id },
    data: {
      originalFileName: req.file.originalname,
      fileName: sanitized,
      fileUrl: uploaded.url,
      secureUrl: uploaded.secureUrl,
      publicId: uploaded.publicId,
      mimeType: req.file.mimetype,
      fileExtension: resolved.extension,
      fileSize: req.file.size,
      resourceType: uploaded.resourceType,
      uploadedBy: req.admin!.sub,
    },
  });

  // Only remove the old asset after the DB row points at the new one, so a
  // mid-flight failure never leaves the DB referencing a deleted asset.
  await deleteFromCloudinary(existing.publicId, existing.resourceType as "image" | "video" | "raw");

  await writeAuditLog({
    action: "HEALTH_EDUCATION_ATTACHMENT_REPLACED",
    entityType: "healthEducationAttachment",
    entityId: attachment.id,
    adminId: req.admin!.sub,
    adminEmail: req.admin!.email,
    details: { resourceId: attachment.resourceId, originalFileName: attachment.originalFileName },
  });

  res.json({ attachment: serializeAttachment(attachment) });
});

const reorderSchema = z.object({ attachmentIds: z.array(z.string().min(1)).min(1) });

router.patch("/resources/:id/attachments/order", async (req, res) => {
  const parsed = reorderSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: z.flattenError(parsed.error) });
    return;
  }

  const attachments = await prisma.healthEducationAttachment.findMany({ where: { resourceId: String(req.params.id) } });
  const validIds = new Set(attachments.map((a) => a.id));
  if (parsed.data.attachmentIds.some((id) => !validIds.has(id))) {
    res.status(400).json({ error: "attachmentIds must match this resource's attachments" });
    return;
  }

  await prisma.$transaction(
    parsed.data.attachmentIds.map((id, index) =>
      prisma.healthEducationAttachment.update({ where: { id }, data: { sortOrder: index } }),
    ),
  );

  res.status(204).send();
});

// Cloudinary being unconfigured is an operator/config problem, not a server
// bug — surface it as a clean 503 instead of falling through to the generic
// 500 handler, scoped to this router only.
router.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (err instanceof Error && err.message.startsWith("Cloudinary is not configured")) {
    res.status(503).json({ error: err.message });
    return;
  }
  next(err);
});

export default router;
