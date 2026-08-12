// Allowlist of file types the Health Education Library accepts. Deny by
// default: any extension not listed here (including executables/scripts) is
// rejected before a file ever reaches Cloudinary. This is the single source
// of truth for both Multer's fileFilter and the folder/resourceType Cloudinary
// upload calls use — see cloudinary.ts.
export type CloudinaryResourceType = "image" | "video" | "raw";
export type FolderCategory = "images" | "videos" | "audio" | "attachments";

interface FileTypeRule {
  mimeTypes: string[];
  cloudinaryResourceType: CloudinaryResourceType;
  folderCategory: FolderCategory;
}

export const HEALTH_ED_ALLOWED_FILE_TYPES: Record<string, FileTypeRule> = {
  pdf: { mimeTypes: ["application/pdf"], cloudinaryResourceType: "raw", folderCategory: "attachments" },
  doc: { mimeTypes: ["application/msword"], cloudinaryResourceType: "raw", folderCategory: "attachments" },
  docx: { mimeTypes: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"], cloudinaryResourceType: "raw", folderCategory: "attachments" },
  xls: { mimeTypes: ["application/vnd.ms-excel"], cloudinaryResourceType: "raw", folderCategory: "attachments" },
  xlsx: { mimeTypes: ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"], cloudinaryResourceType: "raw", folderCategory: "attachments" },
  ppt: { mimeTypes: ["application/vnd.ms-powerpoint"], cloudinaryResourceType: "raw", folderCategory: "attachments" },
  pptx: { mimeTypes: ["application/vnd.openxmlformats-officedocument.presentationml.presentation"], cloudinaryResourceType: "raw", folderCategory: "attachments" },
  txt: { mimeTypes: ["text/plain"], cloudinaryResourceType: "raw", folderCategory: "attachments" },
  csv: { mimeTypes: ["text/csv", "application/vnd.ms-excel"], cloudinaryResourceType: "raw", folderCategory: "attachments" },
  zip: { mimeTypes: ["application/zip", "application/x-zip-compressed"], cloudinaryResourceType: "raw", folderCategory: "attachments" },
  rar: { mimeTypes: ["application/vnd.rar", "application/x-rar-compressed"], cloudinaryResourceType: "raw", folderCategory: "attachments" },

  jpg: { mimeTypes: ["image/jpeg"], cloudinaryResourceType: "image", folderCategory: "images" },
  jpeg: { mimeTypes: ["image/jpeg"], cloudinaryResourceType: "image", folderCategory: "images" },
  png: { mimeTypes: ["image/png"], cloudinaryResourceType: "image", folderCategory: "images" },
  webp: { mimeTypes: ["image/webp"], cloudinaryResourceType: "image", folderCategory: "images" },
  gif: { mimeTypes: ["image/gif"], cloudinaryResourceType: "image", folderCategory: "images" },
  svg: { mimeTypes: ["image/svg+xml"], cloudinaryResourceType: "image", folderCategory: "images" },

  mp4: { mimeTypes: ["video/mp4"], cloudinaryResourceType: "video", folderCategory: "videos" },
  mov: { mimeTypes: ["video/quicktime"], cloudinaryResourceType: "video", folderCategory: "videos" },
  avi: { mimeTypes: ["video/x-msvideo", "video/avi", "video/msvideo"], cloudinaryResourceType: "video", folderCategory: "videos" },
  webm: { mimeTypes: ["video/webm"], cloudinaryResourceType: "video", folderCategory: "videos" },

  // Cloudinary has no separate "audio" resource type — audio files upload
  // under resourceType "video" — but we still keep them in their own
  // Cloudinary *folder* (folderCategory) for a human-readable asset tree.
  mp3: { mimeTypes: ["audio/mpeg", "audio/mp3"], cloudinaryResourceType: "video", folderCategory: "audio" },
  wav: { mimeTypes: ["audio/wav", "audio/x-wav", "audio/wave"], cloudinaryResourceType: "video", folderCategory: "audio" },
  m4a: { mimeTypes: ["audio/mp4", "audio/x-m4a"], cloudinaryResourceType: "video", folderCategory: "audio" },
  ogg: { mimeTypes: ["audio/ogg", "application/ogg"], cloudinaryResourceType: "video", folderCategory: "audio" },
};

export const HEALTH_ED_IMAGE_EXTENSIONS = Object.entries(HEALTH_ED_ALLOWED_FILE_TYPES)
  .filter(([, rule]) => rule.folderCategory === "images")
  .map(([ext]) => ext);

export interface ResolvedFileType {
  extension: string;
  cloudinaryResourceType: CloudinaryResourceType;
  folderCategory: FolderCategory;
}

function extensionOf(filename: string): string {
  const idx = filename.lastIndexOf(".");
  if (idx === -1 || idx === filename.length - 1) return "";
  return filename.slice(idx + 1).toLowerCase();
}

// Validates the file's extension against the allowlist. The (browser- or
// client-supplied) mimetype is accepted defensively but never trusted alone —
// an unrecognized/absent mimetype for an otherwise-allowed extension is still
// accepted, since browsers report inconsistent mimetypes for some of these
// formats (e.g. .csv, .m4a). A mismatched-but-known mimetype for a *different*
// allowed extension is rejected as suspicious.
export function resolveFileTypeInfo(originalFilename: string, mimetype: string): ResolvedFileType | null {
  const extension = extensionOf(originalFilename);
  const rule = HEALTH_ED_ALLOWED_FILE_TYPES[extension];
  if (!rule) return null;

  const mimeIsKnownForAnotherType = Object.entries(HEALTH_ED_ALLOWED_FILE_TYPES).some(
    ([ext, otherRule]) => ext !== extension && otherRule.mimeTypes.includes(mimetype) && !rule.mimeTypes.includes(mimetype),
  );
  if (mimeIsKnownForAnotherType) return null;

  return { extension, cloudinaryResourceType: rule.cloudinaryResourceType, folderCategory: rule.folderCategory };
}

export function isAllowedImageExtension(originalFilename: string): boolean {
  return HEALTH_ED_IMAGE_EXTENSIONS.includes(extensionOf(originalFilename));
}

// Never trust the original filename beyond display metadata: strips path
// separators/control characters, restricts to a safe charset, and caps
// length. The (already-validated) extension is preserved separately by callers.
export function sanitizeFilename(originalName: string): string {
  const base = originalName.split(/[/\\]/).pop() ?? "file";
  const cleaned = base
    .normalize("NFKD")
    .replace(/[^\w.\- ]+/g, "")
    .replace(/\s+/g, "-")
    .replace(/\.{2,}/g, ".")
    .replace(/^[.-]+/, "")
    .slice(0, 150);
  return cleaned || "file";
}
