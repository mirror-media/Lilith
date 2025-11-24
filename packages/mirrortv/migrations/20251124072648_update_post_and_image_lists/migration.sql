/*
  Warnings:

  - The `state` column on the `Post` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "adTraceCode" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "audio" INTEGER,
ADD COLUMN     "brief" JSONB,
ADD COLUMN     "briefApiData" JSONB,
ADD COLUMN     "briefHtml" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "content" JSONB,
ADD COLUMN     "contentApiData" JSONB,
ADD COLUMN     "contentHtml" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "exclusive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "heroCaption" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "heroImage" INTEGER,
ADD COLUMN     "heroImageSize" TEXT DEFAULT 'normal',
ADD COLUMN     "isAdBlocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isAdult" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isAdvertised" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lockBy" INTEGER,
ADD COLUMN     "lockExpireAt" TIMESTAMP(3),
ADD COLUMN     "lockTime" TIMESTAMP(3),
ADD COLUMN     "manualOrderOfRelatedPosts" JSONB,
ADD COLUMN     "manualOrderOfWriters" JSONB,
ADD COLUMN     "notFeed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ogDescription" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "ogImage" INTEGER,
ADD COLUMN     "ogTitle" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "otherbyline" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "publishedDateString" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "source" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "style" TEXT DEFAULT 'article',
ADD COLUMN     "updateTimeStamp" BOOLEAN NOT NULL DEFAULT false,
DROP COLUMN "state",
ADD COLUMN     "state" TEXT DEFAULT 'draft';

-- DropEnum
DROP TYPE "PostStateType";

-- CreateTable
CREATE TABLE "_Post_writers" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Post_photographers" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Post_cameraOperators" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Post_designers" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Post_engineers" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Post_vocals" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Post_tags" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Post_relatedPosts" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Post_categories" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_Post_writers_AB_unique" ON "_Post_writers"("A", "B");

-- CreateIndex
CREATE INDEX "_Post_writers_B_index" ON "_Post_writers"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Post_photographers_AB_unique" ON "_Post_photographers"("A", "B");

-- CreateIndex
CREATE INDEX "_Post_photographers_B_index" ON "_Post_photographers"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Post_cameraOperators_AB_unique" ON "_Post_cameraOperators"("A", "B");

-- CreateIndex
CREATE INDEX "_Post_cameraOperators_B_index" ON "_Post_cameraOperators"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Post_designers_AB_unique" ON "_Post_designers"("A", "B");

-- CreateIndex
CREATE INDEX "_Post_designers_B_index" ON "_Post_designers"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Post_engineers_AB_unique" ON "_Post_engineers"("A", "B");

-- CreateIndex
CREATE INDEX "_Post_engineers_B_index" ON "_Post_engineers"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Post_vocals_AB_unique" ON "_Post_vocals"("A", "B");

-- CreateIndex
CREATE INDEX "_Post_vocals_B_index" ON "_Post_vocals"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Post_tags_AB_unique" ON "_Post_tags"("A", "B");

-- CreateIndex
CREATE INDEX "_Post_tags_B_index" ON "_Post_tags"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Post_relatedPosts_AB_unique" ON "_Post_relatedPosts"("A", "B");

-- CreateIndex
CREATE INDEX "_Post_relatedPosts_B_index" ON "_Post_relatedPosts"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Post_categories_AB_unique" ON "_Post_categories"("A", "B");

-- CreateIndex
CREATE INDEX "_Post_categories_B_index" ON "_Post_categories"("B");

-- CreateIndex
CREATE INDEX "Post_lockBy_idx" ON "Post"("lockBy");

-- CreateIndex
CREATE INDEX "Post_state_idx" ON "Post"("state");

-- CreateIndex
CREATE INDEX "Post_heroImage_idx" ON "Post"("heroImage");

-- CreateIndex
CREATE INDEX "Post_audio_idx" ON "Post"("audio");

-- CreateIndex
CREATE INDEX "Post_ogImage_idx" ON "Post"("ogImage");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_lockBy_fkey" FOREIGN KEY ("lockBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_heroImage_fkey" FOREIGN KEY ("heroImage") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_audio_fkey" FOREIGN KEY ("audio") REFERENCES "Audio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_ogImage_fkey" FOREIGN KEY ("ogImage") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_writers" ADD CONSTRAINT "_Post_writers_A_fkey" FOREIGN KEY ("A") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_writers" ADD CONSTRAINT "_Post_writers_B_fkey" FOREIGN KEY ("B") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_photographers" ADD CONSTRAINT "_Post_photographers_A_fkey" FOREIGN KEY ("A") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_photographers" ADD CONSTRAINT "_Post_photographers_B_fkey" FOREIGN KEY ("B") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_cameraOperators" ADD CONSTRAINT "_Post_cameraOperators_A_fkey" FOREIGN KEY ("A") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_cameraOperators" ADD CONSTRAINT "_Post_cameraOperators_B_fkey" FOREIGN KEY ("B") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_designers" ADD CONSTRAINT "_Post_designers_A_fkey" FOREIGN KEY ("A") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_designers" ADD CONSTRAINT "_Post_designers_B_fkey" FOREIGN KEY ("B") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_engineers" ADD CONSTRAINT "_Post_engineers_A_fkey" FOREIGN KEY ("A") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_engineers" ADD CONSTRAINT "_Post_engineers_B_fkey" FOREIGN KEY ("B") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_vocals" ADD CONSTRAINT "_Post_vocals_A_fkey" FOREIGN KEY ("A") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_vocals" ADD CONSTRAINT "_Post_vocals_B_fkey" FOREIGN KEY ("B") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_tags" ADD CONSTRAINT "_Post_tags_A_fkey" FOREIGN KEY ("A") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_tags" ADD CONSTRAINT "_Post_tags_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_relatedPosts" ADD CONSTRAINT "_Post_relatedPosts_A_fkey" FOREIGN KEY ("A") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_relatedPosts" ADD CONSTRAINT "_Post_relatedPosts_B_fkey" FOREIGN KEY ("B") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_categories" ADD CONSTRAINT "_Post_categories_A_fkey" FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_categories" ADD CONSTRAINT "_Post_categories_B_fkey" FOREIGN KEY ("B") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
