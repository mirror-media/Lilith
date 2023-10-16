/*
  Warnings:

  - You are about to drop the column `politic` on the `PoliticTimeline` table. All the data in the column will be lost.
  - You are about to drop the `_Election_tags` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_Organization_tags` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_Person_tags` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PoliticTimeline" DROP CONSTRAINT "PoliticTimeline_politic_fkey";

-- DropForeignKey
ALTER TABLE "_Election_tags" DROP CONSTRAINT "_Election_tags_A_fkey";

-- DropForeignKey
ALTER TABLE "_Election_tags" DROP CONSTRAINT "_Election_tags_B_fkey";

-- DropForeignKey
ALTER TABLE "_Organization_tags" DROP CONSTRAINT "_Organization_tags_A_fkey";

-- DropForeignKey
ALTER TABLE "_Organization_tags" DROP CONSTRAINT "_Organization_tags_B_fkey";

-- DropForeignKey
ALTER TABLE "_Person_tags" DROP CONSTRAINT "_Person_tags_A_fkey";

-- DropForeignKey
ALTER TABLE "_Person_tags" DROP CONSTRAINT "_Person_tags_B_fkey";

-- DropIndex
DROP INDEX "PoliticTimeline_politic_idx";

-- AlterTable
ALTER TABLE "PoliticTimeline" DROP COLUMN "politic";

-- DropTable
DROP TABLE "_Election_tags";

-- DropTable
DROP TABLE "_Organization_tags";

-- DropTable
DROP TABLE "_Person_tags";

-- CreateTable
CREATE TABLE "_Politic_timeline" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_Politic_timeline_AB_unique" ON "_Politic_timeline"("A", "B");

-- CreateIndex
CREATE INDEX "_Politic_timeline_B_index" ON "_Politic_timeline"("B");

-- AddForeignKey
ALTER TABLE "_Politic_timeline" ADD CONSTRAINT "_Politic_timeline_A_fkey" FOREIGN KEY ("A") REFERENCES "Politic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Politic_timeline" ADD CONSTRAINT "_Politic_timeline_B_fkey" FOREIGN KEY ("B") REFERENCES "PoliticTimeline"("id") ON DELETE CASCADE ON UPDATE CASCADE;
