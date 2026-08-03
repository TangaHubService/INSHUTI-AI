ALTER TABLE "User" ADD COLUMN "province" TEXT;
ALTER TABLE "User" ADD COLUMN "district" TEXT;
ALTER TABLE "User" ADD COLUMN "sector" TEXT;
ALTER TABLE "User" ADD COLUMN "cell" TEXT;
CREATE INDEX "User_district_idx" ON "User"("district");
