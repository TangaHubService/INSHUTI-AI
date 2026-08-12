-- CreateTable: HealthEducationResource (Health Education Library resources)
CREATE TABLE "HealthEducationResource" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "fullDescription" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "targetAudience" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'EN',
    "tags" TEXT NOT NULL DEFAULT '[]',
    "author" TEXT NOT NULL,
    "publishedDate" TIMESTAMP(3) NOT NULL,
    "thumbnailUrl" TEXT,
    "thumbnailSecureUrl" TEXT,
    "thumbnailPublicId" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HealthEducationResource_pkey" PRIMARY KEY ("id")
);

-- CreateTable: HealthEducationAttachment (Cloudinary-backed files on a resource)
CREATE TABLE "HealthEducationAttachment" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "originalFileName" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "secureUrl" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileExtension" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "resourceType" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "uploadedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HealthEducationAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HealthEducationResource_category_idx" ON "HealthEducationResource"("category");
CREATE INDEX "HealthEducationResource_topic_idx" ON "HealthEducationResource"("topic");
CREATE INDEX "HealthEducationResource_language_idx" ON "HealthEducationResource"("language");
CREATE INDEX "HealthEducationResource_createdAt_idx" ON "HealthEducationResource"("createdAt");

-- CreateIndex
CREATE INDEX "HealthEducationAttachment_resourceId_idx" ON "HealthEducationAttachment"("resourceId");

-- AddForeignKey
ALTER TABLE "HealthEducationAttachment" ADD CONSTRAINT "HealthEducationAttachment_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "HealthEducationResource"("id") ON DELETE CASCADE ON UPDATE CASCADE;
