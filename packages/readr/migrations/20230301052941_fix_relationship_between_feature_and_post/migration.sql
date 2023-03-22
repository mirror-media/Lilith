/*
  Warnings:

  - You are about to drop the `_Feature_featurePost` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_Feature_featurePost" DROP CONSTRAINT "_Feature_featurePost_A_fkey";

-- DropForeignKey
ALTER TABLE "_Feature_featurePost" DROP CONSTRAINT "_Feature_featurePost_B_fkey";

-- AlterTable
ALTER TABLE "Feature" ADD COLUMN     "featurePost" INTEGER;

-- DropTable
DROP TABLE "_Feature_featurePost";

-- CreateIndex
CREATE INDEX "Feature_featurePost_idx" ON "Feature"("featurePost");

-- AddForeignKey
ALTER TABLE "Feature" ADD CONSTRAINT "Feature_featurePost_fkey" FOREIGN KEY ("featurePost") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;
