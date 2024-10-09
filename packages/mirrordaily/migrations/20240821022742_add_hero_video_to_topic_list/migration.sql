-- AlterTable
ALTER TABLE "Topic" ADD COLUMN     "heroVideo" INTEGER;

-- CreateIndex
CREATE INDEX "Topic_heroVideo_idx" ON "Topic"("heroVideo");

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_heroVideo_fkey" FOREIGN KEY ("heroVideo") REFERENCES "Video"("id") ON DELETE SET NULL ON UPDATE CASCADE;
