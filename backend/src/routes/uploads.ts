import { Router } from "express";
import { z } from "zod";
import multer from "multer";
import path from "node:path";

import { prisma } from "../lib/prisma.js";
import { requireUser, type AuthenticatedUserRequest } from "../lib/userAuth.js";
import { env } from "../lib/env.js";
import {
  buildConsultationFolder,
  buildSignedDeliveryUrl,
  deleteFromCloudinary,
  uploadBufferToCloudinary,
} from "../lib/cloudinary.js";
import type { CloudinaryResourceType, FolderCategory } from "../lib/healthEducationFiles.js";
import { decryptFileAtRest } from "../lib/fileCrypto.js";

const router = Router();

// Consultation media is stored on Cloudinary (private type) rather than the
// local disk — matches the Health Education Library and works on serverless
// deploys where the filesystem doesn't persist. Legacy rows keep their
// local-disk path and are served via fileCrypto as before.
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = file.mimetype.startsWith("image/") || file.mimetype.startsWith("audio/") || file.mimetype === "application/pdf";
    if (!allowed) { cb(new Error("Only images, audio, and PDF files are permitted")); return; }
    cb(null, true);
  },
});

// Maps a request file to the Cloudinary resource type + folder. Audio has no
// dedicated Cloudinary resource type, so it uploads as "video" (same as the
// Health Education Library) but keeps its own folder for a readable asset tree.
function resolveCloudinaryTarget(mimetype: string): { resourceType: CloudinaryResourceType; folderCategory: FolderCategory } {
  if (mimetype.startsWith("image/")) return { resourceType: "image", folderCategory: "images" };
  if (mimetype.startsWith("audio/")) return { resourceType: "video", folderCategory: "audio" };
  return { resourceType: "raw", folderCategory: "attachments" };
}

router.post("/", requireUser, upload.single("file"), async (req: AuthenticatedUserRequest, res) => {
  if (!req.file) {
    res.status(400).json({ error: "No file provided" });
    return;
  }

  const parsed = z.object({ consultationId: z.string().optional() }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  // Authorize against the consultation BEFORE touching Cloudinary so invalid
  // or unauthorized requests never create orphaned assets.
  let consultationId: string | null = null;
  if (parsed.data.consultationId) {
    const consultation = await prisma.consultation.findUnique({ where: { id: parsed.data.consultationId } });
    if (!consultation) {
      res.status(404).json({ error: "Consultation not found" });
      return;
    }
    const isOwner = consultation.userId === req.user!.userId;
    const professional = await prisma.healthcareProfessional.findUnique({ where: { userId: req.user!.userId } });
    const isAssigned = professional && consultation.professionalId === professional.id;
    if (!isOwner && !isAssigned) {
      res.status(403).json({ error: "Not authorized to attach files to this consultation" });
      return;
    }
    consultationId = consultation.id;
  }

  const { resourceType, folderCategory } = resolveCloudinaryTarget(req.file.mimetype);
  const extension = path.extname(req.file.originalname).replace(/^\./, "") || undefined;

  let uploaded;
  try {
    uploaded = await uploadBufferToCloudinary(req.file.buffer, {
      folder: buildConsultationFolder(consultationId ?? "unsaved", folderCategory),
      filenameForId: req.file.originalname,
      extension,
      resourceType,
      type: "private",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    res.status(message.startsWith("Cloudinary is not configured") ? 503 : 500).json({
      error: message,
    });
    return;
  }

  let attachment;
  try {
    attachment = await prisma.fileAttachment.create({
      data: {
        consultationId,
        userId: req.user!.userId,
        originalName: req.file.originalname,
        storedName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        path: `cloudinary://${uploaded.publicId}`,
        uploadedBy: req.user!.userId,
        publicId: uploaded.publicId,
        secureUrl: uploaded.secureUrl,
        resourceType: uploaded.resourceType,
      },
    });
  } catch (err) {
    // DB failure must not leave an orphaned asset behind.
    await deleteFromCloudinary(uploaded.publicId, uploaded.resourceType).catch(() => undefined);
    throw err;
  }

  res.status(201).json({
    attachment: {
      id: attachment.id,
      originalName: attachment.originalName,
      mimeType: attachment.mimeType,
      size: attachment.size,
      consultationId: attachment.consultationId,
      createdAt: attachment.createdAt,
    },
  });
});

router.get("/consultation/:consultationId", requireUser, async (req: AuthenticatedUserRequest, res) => {
  const consultation = await prisma.consultation.findUnique({ where: { id: String(req.params.consultationId) } });
  if (!consultation) {
    res.status(404).json({ error: "Consultation not found" });
    return;
  }

  const professional = await prisma.healthcareProfessional.findUnique({ where: { userId: req.user!.userId } });
  const isOwner = consultation.userId === req.user!.userId;
  const isAssigned = professional && consultation.professionalId === professional.id;
  if (!isOwner && !isAssigned) {
    res.status(403).json({ error: "Not authorized" });
    return;
  }

  const attachments = await prisma.fileAttachment.findMany({
    where: { consultationId: String(req.params.consultationId) },
    orderBy: { createdAt: "desc" },
  });

  res.json({
    attachments: attachments.map((a: { id: string; originalName: string; mimeType: string; size: number; createdAt: Date }) => ({
      id: a.id,
      originalName: a.originalName,
      mimeType: a.mimeType,
      size: a.size,
      createdAt: a.createdAt,
    })),
  });
});

router.get("/:id", requireUser, async (req: AuthenticatedUserRequest, res) => {
  const attachment = await prisma.fileAttachment.findUnique({ where: { id: String(req.params.id) } });
  if (!attachment || !attachment.consultationId) {
    res.status(404).json({ error: "Attachment not found" });
    return;
  }
  const consultation = await prisma.consultation.findUnique({ where: { id: attachment.consultationId } });
  const professional = await prisma.healthcareProfessional.findUnique({ where: { userId: req.user!.userId } });
  const authorized = consultation && (consultation.userId === req.user!.userId || consultation.professionalId === professional?.id);
  if (!authorized) {
    res.status(403).json({ error: "Not authorized" });
    return;
  }
  res.type(attachment.mimeType);
  res.setHeader("Content-Disposition", `inline; filename="${attachment.originalName.replace(/["\r\n]/g, "_")}"`);

  if (attachment.publicId && attachment.resourceType) {
    // Cloudinary-backed upload: proxy the private asset through the API so
    // the signed URL never reaches the client and every request is auth'd.
    try {
      const signedUrl = buildSignedDeliveryUrl(attachment.publicId, attachment.resourceType as CloudinaryResourceType);
      const cloudinaryRes = await fetch(signedUrl);
      if (!cloudinaryRes.ok) {
        res.status(502).json({ error: "Attachment storage unavailable" });
        return;
      }
      res.send(Buffer.from(await cloudinaryRes.arrayBuffer()));
      return;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Attachment unavailable";
      res.status(502).json({ error: message });
      return;
    }
  }

  // Legacy local-disk rows.
  const decrypted = await decryptFileAtRest(path.resolve(attachment.path));
  res.send(decrypted);
});

export default router;
