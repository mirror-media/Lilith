-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "podcast" INTEGER;

-- AlterTable
ALTER TABLE "Pick" ADD COLUMN     "podcast" INTEGER;

-- CreateTable
CREATE TABLE "Podcast" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL DEFAULT E'',
    "url" TEXT NOT NULL DEFAULT E'',
    "description" TEXT NOT NULL DEFAULT E'',
    "author" TEXT NOT NULL DEFAULT E'',
    "source" INTEGER,
    "category" INTEGER,
    "duration" TEXT NOT NULL DEFAULT E'',
    "published_date" TIMESTAMP(3),
    "og_title" TEXT NOT NULL DEFAULT E'',
    "og_image" TEXT NOT NULL DEFAULT E'',
    "og_description" TEXT NOT NULL DEFAULT E'',
    "isMember" BOOLEAN NOT NULL DEFAULT false,
    "origid" TEXT NOT NULL DEFAULT E'',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Podcast_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_Podcast_tag" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Podcast_url_key" ON "Podcast"("url");

-- CreateIndex
CREATE INDEX "Podcast_source_idx" ON "Podcast"("source");

-- CreateIndex
CREATE INDEX "Podcast_category_idx" ON "Podcast"("category");

-- CreateIndex
CREATE INDEX "Podcast_createdBy_idx" ON "Podcast"("createdBy");

-- CreateIndex
CREATE INDEX "Podcast_updatedBy_idx" ON "Podcast"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "_Podcast_tag_AB_unique" ON "_Podcast_tag"("A", "B");

-- CreateIndex
CREATE INDEX "_Podcast_tag_B_index" ON "_Podcast_tag"("B");

-- CreateIndex
CREATE INDEX "Comment_podcast_idx" ON "Comment"("podcast");

-- CreateIndex
CREATE INDEX "Pick_podcast_idx" ON "Pick"("podcast");

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_podcast_fkey" FOREIGN KEY ("podcast") REFERENCES "Podcast"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pick" ADD CONSTRAINT "Pick_podcast_fkey" FOREIGN KEY ("podcast") REFERENCES "Podcast"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Podcast" ADD CONSTRAINT "Podcast_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Podcast" ADD CONSTRAINT "Podcast_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Podcast" ADD CONSTRAINT "Podcast_category_fkey" FOREIGN KEY ("category") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Podcast" ADD CONSTRAINT "Podcast_source_fkey" FOREIGN KEY ("source") REFERENCES "Publisher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Podcast_tag" ADD FOREIGN KEY ("A") REFERENCES "Podcast"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Podcast_tag" ADD FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
