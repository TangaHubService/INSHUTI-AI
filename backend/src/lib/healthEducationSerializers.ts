import { decodeJsonColumn } from "./jsonColumn.js";

export interface HealthEducationResourceRow {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  topic: string;
  targetAudience: string;
  language: string;
  tags: string;
  author: string;
  publishedDate: Date;
  thumbnailUrl: string | null;
  thumbnailSecureUrl: string | null;
  thumbnailPublicId: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface HealthEducationAttachmentRow {
  id: string;
  resourceId: string;
  originalFileName: string;
  fileName: string;
  fileUrl: string;
  secureUrl: string;
  publicId: string;
  mimeType: string;
  fileExtension: string;
  fileSize: number;
  resourceType: string;
  sortOrder: number;
  uploadedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export function serializeResource(resource: HealthEducationResourceRow) {
  return { ...resource, tags: decodeJsonColumn(resource.tags) };
}

export function serializeAttachment(attachment: HealthEducationAttachmentRow) {
  return attachment;
}

export function summarizeResource(
  resource: HealthEducationResourceRow & { attachments: Pick<HealthEducationAttachmentRow, "fileExtension">[] },
) {
  const availableFileTypes = Array.from(new Set(resource.attachments.map((a) => a.fileExtension.toUpperCase())));
  const { attachments, ...rest } = resource;
  return {
    ...serializeResource(rest),
    attachmentCount: attachments.length,
    availableFileTypes,
  };
}
