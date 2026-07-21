-- The baseline migration (20260721164651_init) bundles the "active" columns
-- into its CREATE TABLE statements, so it never actually adds them on a
-- production database that already had these tables from before formal
-- migrations existed (created via `prisma db push`). This migration adds
-- them directly and is safe to run even if one of them already exists.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "active" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "AdminUser" ADD COLUMN IF NOT EXISTS "active" BOOLEAN NOT NULL DEFAULT true;
