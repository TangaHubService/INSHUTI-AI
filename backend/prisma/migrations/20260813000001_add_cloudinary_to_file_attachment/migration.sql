-- AlterTable: FileAttachment — Cloudinary-backed consultation uploads
-- (voice messages, images, PDFs). Legacy rows keep their local-disk path;
-- new rows store a cloudinary://<publicId> path plus the Cloudinary ids.
ALTER TABLE "FileAttachment" ALTER COLUMN "path" SET DEFAULT '';
ALTER TABLE "FileAttachment" ADD COLUMN "publicId" TEXT;
ALTER TABLE "FileAttachment" ADD COLUMN "secureUrl" TEXT;
ALTER TABLE "FileAttachment" ADD COLUMN "resourceType" TEXT;