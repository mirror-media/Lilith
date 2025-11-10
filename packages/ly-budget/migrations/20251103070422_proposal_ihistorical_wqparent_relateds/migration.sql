/*
  Warnings:

  - You are about to drop the column `parentProposals` on the `Proposal` table. All the data in the column will be lost.
  - You are about to drop the `_Proposal_historicalProposals` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Proposal" DROP CONSTRAINT "Proposal_parentProposals_fkey";

-- DropForeignKey
ALTER TABLE "_Proposal_historicalProposals" DROP CONSTRAINT "_Proposal_historicalProposals_A_fkey";

-- DropForeignKey
ALTER TABLE "_Proposal_historicalProposals" DROP CONSTRAINT "_Proposal_historicalProposals_B_fkey";

-- DropIndex
DROP INDEX "Proposal_parentProposals_idx";

-- AlterTable
ALTER TABLE "Proposal" DROP COLUMN "parentProposals",
ADD COLUMN     "historicalParentProposals" INTEGER,
ADD COLUMN     "mergedParentProposals" INTEGER;

-- DropTable
DROP TABLE "_Proposal_historicalProposals";

-- CreateIndex
CREATE INDEX "Proposal_mergedParentProposals_idx" ON "Proposal"("mergedParentProposals");

-- CreateIndex
CREATE INDEX "Proposal_historicalParentProposals_idx" ON "Proposal"("historicalParentProposals");

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_mergedParentProposals_fkey" FOREIGN KEY ("mergedParentProposals") REFERENCES "Proposal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_historicalParentProposals_fkey" FOREIGN KEY ("historicalParentProposals") REFERENCES "Proposal"("id") ON DELETE SET NULL ON UPDATE CASCADE;
