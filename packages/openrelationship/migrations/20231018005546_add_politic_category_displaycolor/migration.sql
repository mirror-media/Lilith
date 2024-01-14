-- AlterTable
ALTER TABLE "PoliticCategory" ADD COLUMN     "displayColor" TEXT NOT NULL DEFAULT '#000000';

-- CreateIndex
CREATE INDEX "Tag_state_idx" ON "Tag"("state");
