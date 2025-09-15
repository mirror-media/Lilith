-- AlterTable
ALTER TABLE "Topic" ADD COLUMN     "publishedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "Topic_publishedDate_idx" ON "Topic"("publishedDate");
