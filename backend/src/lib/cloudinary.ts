import crypto from "node:crypto";
import { Readable } from "node:stream";
import { v2 as cloudinary } from "cloudinary";

import { env } from "./env.js";
import type { CloudinaryResourceType, FolderCategory } from "./healthEducationFiles.js";

let configured = false;

function ensureConfigured(): void {
  if (configured) return;
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    throw new Error(
      "Cloudinary is not configured — set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in backend/.env",
    );
  }
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  configured = true;
}

// health-education/resources/{resourceId}/{images|videos|audio|attachments}
// resourceId always comes from an already-created DB row — never hardcoded.
export function buildCloudinaryFolder(resourceId: string, folderCategory: FolderCategory): string {
  return `health-education/resources/${resourceId}/${folderCategory}`;
}

// consultations/{consultationId}/{images|audio|attachments}
// consultationId always comes from an already-created DB row — never hardcoded.
export function buildConsultationFolder(consultationId: string, folderCategory: FolderCategory): string {
  return `consultations/${consultationId}/${folderCategory}`;
}

function slugifyBase(name: string): string {
  const withoutExt = name.replace(/\.[^./]+$/, "");
  const slug = withoutExt
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
  return slug || "file";
}

export interface CloudinaryUploadResult {
  url: string;
  secureUrl: string;
  publicId: string;
  resourceType: CloudinaryResourceType;
  bytes: number;
}

export function uploadBufferToCloudinary(
  buffer: Buffer,
  options: {
    folder: string;
    filenameForId: string;
    extension?: string;
    resourceType: CloudinaryResourceType;
    // "upload" (public, default — used by the Health Education Library) or
    // "private" (used by consultations: only deliverable via signed URLs).
    type?: "upload" | "private" | "authenticated";
  },
): Promise<CloudinaryUploadResult> {
  ensureConfigured();

  // Cloudinary's "raw" delivery requires the extension to be part of the
  // stored public_id (unlike image/video, where it appends the format for
  // you) — otherwise delivery URLs 404. Embed it explicitly for raw uploads.
  const uniqueId = `${slugifyBase(options.filenameForId)}-${crypto.randomUUID()}`;
  const publicId = options.resourceType === "raw" ? `${uniqueId}.${options.extension ?? "bin"}` : uniqueId;

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder,
        public_id: publicId,
        resource_type: options.resourceType,
        type: options.type ?? "upload",
        use_filename: false,
        unique_filename: false,
        overwrite: false,
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed"));
          return;
        }
        resolve({
          url: result.url,
          secureUrl: result.secure_url,
          publicId: result.public_id,
          resourceType: options.resourceType,
          bytes: result.bytes,
        });
      },
    );
    Readable.from(buffer).pipe(uploadStream);
  });
}

// Best-effort — never throws, so a Cloudinary hiccup never blocks a DB
// delete/replace. Failures are logged for manual cleanup.
export async function deleteFromCloudinary(publicId: string, resourceType: CloudinaryResourceType): Promise<void> {
  try {
    ensureConfigured();
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    console.error(`Failed to delete Cloudinary asset ${publicId} (${resourceType})`, error);
  }
}

export function buildDownloadUrl(publicId: string, resourceType: CloudinaryResourceType, downloadFilename: string): string {
  ensureConfigured();
  return cloudinary.url(publicId, {
    resource_type: resourceType,
    secure: true,
    flags: `attachment:${downloadFilename.replace(/\.[^./]+$/, "")}`,
  });
}

// Signed, inline delivery URL for private (consultation) assets. Private
// assets 404 over plain URLs, so this must stay server-side — used by the
// uploads router to proxy the file to an authenticated requester. Private
// video (audio) URLs reject delivery transforms (e.g. fl_inline) with a 400,
// so no transforms are applied; they are served inline by default.
export function buildSignedDeliveryUrl(publicId: string, resourceType: CloudinaryResourceType): string {
  ensureConfigured();
  return cloudinary.url(publicId, {
    resource_type: resourceType,
    secure: true,
    type: "private",
    sign_url: true,
  });
}
