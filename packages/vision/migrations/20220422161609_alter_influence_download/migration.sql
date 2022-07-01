/*
  Warnings:

  - You are about to drop the `_Download_influence` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_Download_influence" DROP CONSTRAINT "_Download_influence_A_fkey";

-- DropForeignKey
ALTER TABLE "_Download_influence" DROP CONSTRAINT "_Download_influence_B_fkey";

-- AlterTable
ALTER TABLE "Influence" ADD COLUMN     "download" INTEGER;

-- DropTable
DROP TABLE "_Download_influence";

-- CreateIndex
CREATE INDEX "Influence_download_idx" ON "Influence"("download");

-- AddForeignKey
ALTER TABLE "Influence" ADD CONSTRAINT "Influence_download_fkey" FOREIGN KEY ("download") REFERENCES "Download"("id") ON DELETE SET NULL ON UPDATE CASCADE;
