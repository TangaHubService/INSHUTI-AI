// Classifies an attachment's preview kind + display metadata from its
// fileExtension/mimeType. Shared by the admin uploader, the resource cards,
// and the public attachment preview so the mapping is defined exactly once.
export type PreviewKind = "image" | "pdf" | "video" | "audio" | "text" | "office" | "archive" | "other";

export interface FileTypeMeta {
  kind: PreviewKind;
  label: string;
  icon: string;
}

const RULES: Record<string, FileTypeMeta> = {
  pdf: { kind: "pdf", label: "PDF", icon: "i-file" },
  doc: { kind: "office", label: "Word Document", icon: "i-file" },
  docx: { kind: "office", label: "Word Document", icon: "i-file" },
  xls: { kind: "office", label: "Excel Spreadsheet", icon: "i-file" },
  xlsx: { kind: "office", label: "Excel Spreadsheet", icon: "i-file" },
  ppt: { kind: "office", label: "PowerPoint", icon: "i-file" },
  pptx: { kind: "office", label: "PowerPoint", icon: "i-file" },
  txt: { kind: "text", label: "Text File", icon: "i-file" },
  csv: { kind: "text", label: "CSV File", icon: "i-file" },
  zip: { kind: "archive", label: "ZIP Archive", icon: "i-archive" },
  rar: { kind: "archive", label: "RAR Archive", icon: "i-archive" },
  jpg: { kind: "image", label: "Image", icon: "i-image" },
  jpeg: { kind: "image", label: "Image", icon: "i-image" },
  png: { kind: "image", label: "Image", icon: "i-image" },
  webp: { kind: "image", label: "Image", icon: "i-image" },
  gif: { kind: "image", label: "Image", icon: "i-image" },
  svg: { kind: "image", label: "Image", icon: "i-image" },
  mp4: { kind: "video", label: "Video", icon: "i-video" },
  mov: { kind: "video", label: "Video", icon: "i-video" },
  avi: { kind: "video", label: "Video", icon: "i-video" },
  webm: { kind: "video", label: "Video", icon: "i-video" },
  mp3: { kind: "audio", label: "Audio", icon: "i-mic" },
  wav: { kind: "audio", label: "Audio", icon: "i-mic" },
  m4a: { kind: "audio", label: "Audio", icon: "i-mic" },
  ogg: { kind: "audio", label: "Audio", icon: "i-mic" },
};

export function getFileTypeMeta(fileExtension: string): FileTypeMeta {
  return RULES[fileExtension.toLowerCase()] ?? { kind: "other", label: fileExtension.toUpperCase() || "File", icon: "i-file" };
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Inserts a Cloudinary delivery transformation (f_auto,q_auto + optional
// width) into a secure_url for responsive, optimized image delivery.
export function cloudinaryImageTransform(secureUrl: string, width?: number): string {
  const transform = width ? `f_auto,q_auto,w_${width}` : "f_auto,q_auto";
  return secureUrl.replace("/upload/", `/upload/${transform}/`);
}
