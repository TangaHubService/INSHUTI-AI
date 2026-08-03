import { Router } from "express";
import { z } from "zod";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";

import { prisma } from "../lib/prisma.js";
import { requireUser, type AuthenticatedUserRequest } from "../lib/userAuth.js";
import { env } from "../lib/env.js";
import { decryptFileAtRest, encryptFileAtRest } from "../lib/fileCrypto.js";

const router = Router();

const UPLOAD_DIR = path.resolve(env.UPLOAD_DIR);
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = file.mimetype.startsWith("image/") || file.mimetype.startsWith("audio/") || file.mimetype === "application/pdf";
    if (!allowed) { cb(new Error("Only images, audio, and PDF files are permitted")); return; }
    cb(null, true);
  },
});

router.post("/", requireUser, upload.single("file"), async (req: AuthenticatedUserRequest, res) => {
  if (!req.file) {
    res.status(400).json({ error: "No file provided" });
    return;
  }

  // Multer writes first; encrypt immediately so validation/authorization
  // failures cannot leave sensitive media readable on disk.
  await encryptFileAtRest(req.file.path);

  const parsed = z.object({ consultationId: z.string().optional() }).safeParse(req.body);
  if (!parsed.success) {
    await fs.promises.unlink(req.file.path).catch(() => undefined);
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  if (parsed.data.consultationId) {
    const consultation = await prisma.consultation.findUnique({ where: { id: parsed.data.consultationId } });
    if (!consultation) {
      await fs.promises.unlink(req.file!.path).catch(() => undefined);
      res.status(404).json({ error: "Consultation not found" });
      return;
    }
    const isOwner = consultation.userId === req.user!.userId;
    const professional = await prisma.healthcareProfessional.findUnique({ where: { userId: req.user!.userId } });
    const isAssigned = professional && consultation.professionalId === professional.id;
    if (!isOwner && !isAssigned) {
      await fs.promises.unlink(req.file!.path).catch(() => undefined);
      res.status(403).json({ error: "Not authorized to attach files to this consultation" });
      return;
    }
  }

  const attachment = await prisma.fileAttachment.create({
    data: {
      consultationId: parsed.data.consultationId ?? null,
      userId: req.user!.userId,
      originalName: req.file.originalname,
      storedName: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      uploadedBy: req.user!.userId,
    },
  });

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
  const decrypted = await decryptFileAtRest(path.resolve(attachment.path));
  res.send(decrypted);
});

export default router;
