-- AlterTable
ALTER TABLE "ArtShow" ADD COLUMN     "heroVideo" INTEGER;

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "video" INTEGER;

-- AlterTable
ALTER TABLE "Topic" ADD COLUMN     "heroVideo" INTEGER;

-- CreateTable
CREATE TABLE "Video" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "youtubeUrl" TEXT NOT NULL DEFAULT '',
    "file_filesize" INTEGER,
    "file_filename" TEXT,
    "duration" INTEGER DEFAULT 0,
    "fileDuration_internal" TEXT NOT NULL DEFAULT '',
    "youtubeDuration_internal" TEXT NOT NULL DEFAULT '',
    "state" TEXT DEFAULT 'draft',
    "publishTime" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_Video_tags" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Video_categories" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Topic_multivideo" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE INDEX "Video_state_idx" ON "Video"("state");

-- CreateIndex
CREATE INDEX "Video_createdBy_idx" ON "Video"("createdBy");

-- CreateIndex
CREATE INDEX "Video_updatedBy_idx" ON "Video"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "_Video_tags_AB_unique" ON "_Video_tags"("A", "B");

-- CreateIndex
CREATE INDEX "_Video_tags_B_index" ON "_Video_tags"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Video_categories_AB_unique" ON "_Video_categories"("A", "B");

-- CreateIndex
CREATE INDEX "_Video_categories_B_index" ON "_Video_categories"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Topic_multivideo_AB_unique" ON "_Topic_multivideo"("A", "B");

-- CreateIndex
CREATE INDEX "_Topic_multivideo_B_index" ON "_Topic_multivideo"("B");

-- CreateIndex
CREATE INDEX "ArtShow_heroVideo_idx" ON "ArtShow"("heroVideo");

-- CreateIndex
CREATE INDEX "Event_video_idx" ON "Event"("video");

-- CreateIndex
CREATE INDEX "Topic_heroVideo_idx" ON "Topic"("heroVideo");

-- AddForeignKey
ALTER TABLE "ArtShow" ADD CONSTRAINT "ArtShow_heroVideo_fkey" FOREIGN KEY ("heroVideo") REFERENCES "Video"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_video_fkey" FOREIGN KEY ("video") REFERENCES "Video"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_heroVideo_fkey" FOREIGN KEY ("heroVideo") REFERENCES "Video"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Video_tags" ADD CONSTRAINT "_Video_tags_A_fkey" FOREIGN KEY ("A") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Video_tags" ADD CONSTRAINT "_Video_tags_B_fkey" FOREIGN KEY ("B") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Video_categories" ADD CONSTRAINT "_Video_categories_A_fkey" FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Video_categories" ADD CONSTRAINT "_Video_categories_B_fkey" FOREIGN KEY ("B") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Topic_multivideo" ADD CONSTRAINT "_Topic_multivideo_A_fkey" FOREIGN KEY ("A") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Topic_multivideo" ADD CONSTRAINT "_Topic_multivideo_B_fkey" FOREIGN KEY ("B") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;
