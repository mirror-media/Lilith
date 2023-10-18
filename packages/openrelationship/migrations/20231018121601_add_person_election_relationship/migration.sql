/*
  Warnings:

  - You are about to drop the column `state` on the `PoliticCategory` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `Tag` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "PoliticCategory_state_idx";

-- DropIndex
DROP INDEX "Tag_state_idx";

-- AlterTable
ALTER TABLE "PersonElection" ADD COLUMN     "mainCandidate" INTEGER,
ADD COLUMN     "status" TEXT DEFAULT 'notverified';

-- AlterTable
ALTER TABLE "PoliticCategory" DROP COLUMN "state";

-- AlterTable
ALTER TABLE "Tag" DROP COLUMN "state";

-- CreateIndex
CREATE INDEX "PersonElection_mainCandidate_idx" ON "PersonElection"("mainCandidate");

-- AddForeignKey
ALTER TABLE "PersonElection" ADD CONSTRAINT "PersonElection_mainCandidate_fkey" FOREIGN KEY ("mainCandidate") REFERENCES "PersonElection"("id") ON DELETE SET NULL ON UPDATE CASCADE;
