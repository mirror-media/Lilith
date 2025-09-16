/*
  Warnings:

  - Made the column `description` on table `Meeting` required. This step will fail if there are existing NULL values in that column.
  - Made the column `description` on table `People` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Meeting" ADD COLUMN     "government" INTEGER,
ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "description" SET DEFAULT '';

-- AlterTable
ALTER TABLE "People" ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "description" SET DEFAULT '';

-- AlterTable
ALTER TABLE "Proposal" ADD COLUMN     "publishStatus" TEXT DEFAULT 'draft',
ADD COLUMN     "recognitionAnswer" TEXT;

-- AlterTable
ALTER TABLE "RecognitionImage" ADD COLUMN     "government" INTEGER,
ADD COLUMN     "pageNumber" INTEGER,
ADD COLUMN     "verificationStatus" TEXT DEFAULT 'not_verified';

-- AlterTable
ALTER TABLE "RecognitionStatus" ADD COLUMN     "reason" TEXT;

-- CreateTable
CREATE TABLE "_RecognitionStatus_proposers" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_RecognitionStatus_coSigners" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_RecognitionImage_historicalProposals" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_RecognitionImage_mergedProposals" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_RecognitionStatus_proposers_AB_unique" ON "_RecognitionStatus_proposers"("A", "B");

-- CreateIndex
CREATE INDEX "_RecognitionStatus_proposers_B_index" ON "_RecognitionStatus_proposers"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_RecognitionStatus_coSigners_AB_unique" ON "_RecognitionStatus_coSigners"("A", "B");

-- CreateIndex
CREATE INDEX "_RecognitionStatus_coSigners_B_index" ON "_RecognitionStatus_coSigners"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_RecognitionImage_historicalProposals_AB_unique" ON "_RecognitionImage_historicalProposals"("A", "B");

-- CreateIndex
CREATE INDEX "_RecognitionImage_historicalProposals_B_index" ON "_RecognitionImage_historicalProposals"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_RecognitionImage_mergedProposals_AB_unique" ON "_RecognitionImage_mergedProposals"("A", "B");

-- CreateIndex
CREATE INDEX "_RecognitionImage_mergedProposals_B_index" ON "_RecognitionImage_mergedProposals"("B");

-- CreateIndex
CREATE INDEX "Meeting_government_idx" ON "Meeting"("government");

-- CreateIndex
CREATE INDEX "Proposal_publishStatus_idx" ON "Proposal"("publishStatus");

-- CreateIndex
CREATE INDEX "RecognitionImage_government_idx" ON "RecognitionImage"("government");

-- CreateIndex
CREATE INDEX "RecognitionImage_verificationStatus_idx" ON "RecognitionImage"("verificationStatus");

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_government_fkey" FOREIGN KEY ("government") REFERENCES "Government"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecognitionImage" ADD CONSTRAINT "RecognitionImage_government_fkey" FOREIGN KEY ("government") REFERENCES "Government"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RecognitionStatus_proposers" ADD CONSTRAINT "_RecognitionStatus_proposers_A_fkey" FOREIGN KEY ("A") REFERENCES "People"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RecognitionStatus_proposers" ADD CONSTRAINT "_RecognitionStatus_proposers_B_fkey" FOREIGN KEY ("B") REFERENCES "RecognitionStatus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RecognitionStatus_coSigners" ADD CONSTRAINT "_RecognitionStatus_coSigners_A_fkey" FOREIGN KEY ("A") REFERENCES "People"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RecognitionStatus_coSigners" ADD CONSTRAINT "_RecognitionStatus_coSigners_B_fkey" FOREIGN KEY ("B") REFERENCES "RecognitionStatus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RecognitionImage_historicalProposals" ADD CONSTRAINT "_RecognitionImage_historicalProposals_A_fkey" FOREIGN KEY ("A") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RecognitionImage_historicalProposals" ADD CONSTRAINT "_RecognitionImage_historicalProposals_B_fkey" FOREIGN KEY ("B") REFERENCES "RecognitionImage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RecognitionImage_mergedProposals" ADD CONSTRAINT "_RecognitionImage_mergedProposals_A_fkey" FOREIGN KEY ("A") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RecognitionImage_mergedProposals" ADD CONSTRAINT "_RecognitionImage_mergedProposals_B_fkey" FOREIGN KEY ("B") REFERENCES "RecognitionImage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
