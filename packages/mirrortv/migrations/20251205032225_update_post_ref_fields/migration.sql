-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "heroVideo" INTEGER,
ADD COLUMN     "relatedTopic" INTEGER,
ADD COLUMN     "topics" INTEGER;

-- CreateTable
CREATE TABLE "_Post_download" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_Post_download_AB_unique" ON "_Post_download"("A", "B");

-- CreateIndex
CREATE INDEX "_Post_download_B_index" ON "_Post_download"("B");

-- CreateIndex
CREATE INDEX "Post_heroVideo_idx" ON "Post"("heroVideo");

-- CreateIndex
CREATE INDEX "Post_topics_idx" ON "Post"("topics");

-- CreateIndex
CREATE INDEX "Post_relatedTopic_idx" ON "Post"("relatedTopic");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_heroVideo_fkey" FOREIGN KEY ("heroVideo") REFERENCES "Video"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_topics_fkey" FOREIGN KEY ("topics") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_relatedTopic_fkey" FOREIGN KEY ("relatedTopic") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_download" ADD CONSTRAINT "_Post_download_A_fkey" FOREIGN KEY ("A") REFERENCES "Download"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_download" ADD CONSTRAINT "_Post_download_B_fkey" FOREIGN KEY ("B") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
