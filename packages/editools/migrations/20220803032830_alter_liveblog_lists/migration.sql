-- AlterTable
ALTER TABLE "Liveblog" ADD COLUMN     "credit" TEXT NOT NULL DEFAULT E'';

-- AlterTable
ALTER TABLE "LiveblogItem" ADD COLUMN     "heroVideo" INTEGER,
ADD COLUMN     "imageCaption" TEXT NOT NULL DEFAULT E'';

-- CreateIndex
CREATE INDEX "LiveblogItem_heroVideo_idx" ON "LiveblogItem"("heroVideo");

-- AddForeignKey
ALTER TABLE "LiveblogItem" ADD CONSTRAINT "LiveblogItem_heroVideo_fkey" FOREIGN KEY ("heroVideo") REFERENCES "Video"("id") ON DELETE SET NULL ON UPDATE CASCADE;
