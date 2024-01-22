/*
  Warnings:

  - You are about to drop the column `ImageDesktop` on the `Collaboration` table. All the data in the column will be lost.
  - You are about to drop the column `ImageMobile` on the `Collaboration` table. All the data in the column will be lost.
  - You are about to drop the column `ImageTablet` on the `Collaboration` table. All the data in the column will be lost.
  - You are about to drop the column `isFeatured` on the `Collaboration` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Collaboration" DROP CONSTRAINT "Collaboration_ImageDesktop_fkey";

-- DropForeignKey
ALTER TABLE "Collaboration" DROP CONSTRAINT "Collaboration_ImageMobile_fkey";

-- DropForeignKey
ALTER TABLE "Collaboration" DROP CONSTRAINT "Collaboration_ImageTablet_fkey";

-- DropIndex
DROP INDEX "Collaboration_ImageDesktop_idx";

-- DropIndex
DROP INDEX "Collaboration_ImageMobile_idx";

-- DropIndex
DROP INDEX "Collaboration_ImageTablet_idx";

-- AlterTable
ALTER TABLE "Collaboration" DROP COLUMN "ImageDesktop",
DROP COLUMN "ImageMobile",
DROP COLUMN "ImageTablet",
DROP COLUMN "isFeatured",
ADD COLUMN     "bannerDesktop" INTEGER,
ADD COLUMN     "bannerMobile" INTEGER,
ADD COLUMN     "bannerTablet" INTEGER,
ADD COLUMN     "isBanner" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Collaboration_bannerMobile_idx" ON "Collaboration"("bannerMobile");

-- CreateIndex
CREATE INDEX "Collaboration_bannerTablet_idx" ON "Collaboration"("bannerTablet");

-- CreateIndex
CREATE INDEX "Collaboration_bannerDesktop_idx" ON "Collaboration"("bannerDesktop");

-- AddForeignKey
ALTER TABLE "Collaboration" ADD CONSTRAINT "Collaboration_bannerMobile_fkey" FOREIGN KEY ("bannerMobile") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collaboration" ADD CONSTRAINT "Collaboration_bannerTablet_fkey" FOREIGN KEY ("bannerTablet") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collaboration" ADD CONSTRAINT "Collaboration_bannerDesktop_fkey" FOREIGN KEY ("bannerDesktop") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;
