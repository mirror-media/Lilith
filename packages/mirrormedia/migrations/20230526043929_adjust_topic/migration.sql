/*
  Warnings:

  - You are about to drop the column `heroImageSize` on the `Topic` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Image" ADD COLUMN     "isWatermark" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Topic" DROP COLUMN "heroImageSize",
ADD COLUMN     "og_description" TEXT NOT NULL DEFAULT E'',
ADD COLUMN     "og_image" INTEGER,
ADD COLUMN     "og_title" TEXT NOT NULL DEFAULT E'';

-- CreateIndex
CREATE INDEX "Topic_og_image_idx" ON "Topic"("og_image");

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_og_image_fkey" FOREIGN KEY ("og_image") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;
