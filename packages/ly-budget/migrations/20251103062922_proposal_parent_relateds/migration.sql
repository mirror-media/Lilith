/*
  Warnings:

  - You are about to drop the `_Proposal_mergedProposals` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_Proposal_mergedProposals" DROP CONSTRAINT "_Proposal_mergedProposals_A_fkey";

-- DropForeignKey
ALTER TABLE "_Proposal_mergedProposals" DROP CONSTRAINT "_Proposal_mergedProposals_B_fkey";

-- AlterTable
ALTER TABLE "Proposal" ADD COLUMN     "parentProposals" INTEGER;

-- DropTable
DROP TABLE "_Proposal_mergedProposals";

-- CreateIndex
CREATE INDEX "Proposal_parentProposals_idx" ON "Proposal"("parentProposals");

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_parentProposals_fkey" FOREIGN KEY ("parentProposals") REFERENCES "Proposal"("id") ON DELETE SET NULL ON UPDATE CASCADE;
