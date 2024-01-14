-- AlterTable
ALTER TABLE "PoliticPositionChange" ALTER COLUMN "isChanged" DROP NOT NULL,
ALTER COLUMN "isChanged" SET DEFAULT 'same',
ALTER COLUMN "isChanged" SET DATA TYPE TEXT;

-- CreateIndex
CREATE INDEX "PoliticPositionChange_isChanged_idx" ON "PoliticPositionChange"("isChanged");
