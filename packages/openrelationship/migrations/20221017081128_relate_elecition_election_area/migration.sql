/*
  Warnings:

  - You are about to drop the column `level` on the `ElectionArea` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `ElectionArea` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ElectionArea" DROP COLUMN "level",
DROP COLUMN "type",
ADD COLUMN     "election" INTEGER;

-- CreateIndex
CREATE INDEX "ElectionArea_election_idx" ON "ElectionArea"("election");

-- AddForeignKey
ALTER TABLE "ElectionArea" ADD CONSTRAINT "ElectionArea_election_fkey" FOREIGN KEY ("election") REFERENCES "Election"("id") ON DELETE SET NULL ON UPDATE CASCADE;
