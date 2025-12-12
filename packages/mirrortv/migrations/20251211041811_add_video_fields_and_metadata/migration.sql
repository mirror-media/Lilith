-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "coverPhoto" INTEGER,
ADD COLUMN     "description" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "isFeed" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "meta" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "thumbnail" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "url" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "_Video_relatedPosts" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_Video_relatedPosts_AB_unique" ON "_Video_relatedPosts"("A", "B");

-- CreateIndex
CREATE INDEX "_Video_relatedPosts_B_index" ON "_Video_relatedPosts"("B");

-- CreateIndex
CREATE INDEX "Video_coverPhoto_idx" ON "Video"("coverPhoto");

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_coverPhoto_fkey" FOREIGN KEY ("coverPhoto") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Video_relatedPosts" ADD CONSTRAINT "_Video_relatedPosts_A_fkey" FOREIGN KEY ("A") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Video_relatedPosts" ADD CONSTRAINT "_Video_relatedPosts_B_fkey" FOREIGN KEY ("B") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;
