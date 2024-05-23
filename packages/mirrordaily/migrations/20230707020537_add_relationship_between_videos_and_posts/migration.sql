-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "manualOrderOfRelatedVideos" JSONB;

-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "manualOrderOfRelatedPosts" JSONB;

-- CreateTable
CREATE TABLE "_Post_related_videos" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Video_related_posts" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_Post_related_videos_AB_unique" ON "_Post_related_videos"("A", "B");

-- CreateIndex
CREATE INDEX "_Post_related_videos_B_index" ON "_Post_related_videos"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Video_related_posts_AB_unique" ON "_Video_related_posts"("A", "B");

-- CreateIndex
CREATE INDEX "_Video_related_posts_B_index" ON "_Video_related_posts"("B");

-- AddForeignKey
ALTER TABLE "_Post_related_videos" ADD CONSTRAINT "_Post_related_videos_A_fkey" FOREIGN KEY ("A") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_related_videos" ADD CONSTRAINT "_Post_related_videos_B_fkey" FOREIGN KEY ("B") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Video_related_posts" ADD CONSTRAINT "_Video_related_posts_A_fkey" FOREIGN KEY ("A") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Video_related_posts" ADD CONSTRAINT "_Video_related_posts_B_fkey" FOREIGN KEY ("B") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;
