/*
  Warnings:

  - You are about to drop the column `election` on the `RelatedPost` table. All the data in the column will be lost.
  - Made the column `isChanged` on table `PoliticPositionChange` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "RelatedPost" DROP CONSTRAINT "RelatedPost_election_fkey";

-- DropIndex
DROP INDEX "RelatedPost_election_idx";

-- AlterTable
ALTER TABLE "PoliticPositionChange" ALTER COLUMN "isChanged" SET NOT NULL;

-- AlterTable
ALTER TABLE "RelatedPost" DROP COLUMN "election";

-- CreateTable
CREATE TABLE "_RelatedPost_election" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_RelatedPost_election_AB_unique" ON "_RelatedPost_election"("A", "B");

-- CreateIndex
CREATE INDEX "_RelatedPost_election_B_index" ON "_RelatedPost_election"("B");

-- AddForeignKey
ALTER TABLE "_RelatedPost_election" ADD CONSTRAINT "_RelatedPost_election_A_fkey" FOREIGN KEY ("A") REFERENCES "Election"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RelatedPost_election" ADD CONSTRAINT "_RelatedPost_election_B_fkey" FOREIGN KEY ("B") REFERENCES "RelatedPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
