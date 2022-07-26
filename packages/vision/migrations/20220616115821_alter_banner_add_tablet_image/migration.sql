/*
  Warnings:

  - Made the column `register_end` on table `Event` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Banner" ADD COLUMN     "tabletImage" INTEGER;

-- CreateIndex
CREATE INDEX "Banner_tabletImage_idx" ON "Banner"("tabletImage");

-- AddForeignKey
ALTER TABLE "Banner" ADD CONSTRAINT "Banner_tabletImage_fkey" FOREIGN KEY ("tabletImage") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;
