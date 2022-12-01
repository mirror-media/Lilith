/*
  Warnings:

  - You are about to drop the column `desktopImage` on the `Banner` table. All the data in the column will be lost.
  - You are about to drop the column `mobileImage` on the `Banner` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Banner" DROP CONSTRAINT "Banner_desktopImage_fkey";

-- DropForeignKey
ALTER TABLE "Banner" DROP CONSTRAINT "Banner_mobileImage_fkey";

-- DropIndex
DROP INDEX "Banner_desktopImage_idx";

-- DropIndex
DROP INDEX "Banner_mobileImage_idx";

-- AlterTable
ALTER TABLE "Banner" DROP COLUMN "desktopImage",
DROP COLUMN "mobileImage",
ADD COLUMN     "bannerImage" INTEGER,
ALTER COLUMN "publishDate" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "Banner_bannerImage_idx" ON "Banner"("bannerImage");

-- AddForeignKey
ALTER TABLE "Banner" ADD CONSTRAINT "Banner_bannerImage_fkey" FOREIGN KEY ("bannerImage") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;
