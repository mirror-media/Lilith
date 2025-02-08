/*
  Warnings:

  - You are about to drop the column `podcast` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `podcast` on the `Pick` table. All the data in the column will be lost.
  - You are about to drop the column `author` on the `Podcast` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `Podcast` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Podcast` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `Podcast` table. All the data in the column will be lost.
  - You are about to drop the column `isMember` on the `Podcast` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `Podcast` table. All the data in the column will be lost.
  - You are about to drop the column `og_description` on the `Podcast` table. All the data in the column will be lost.
  - You are about to drop the column `og_image` on the `Podcast` table. All the data in the column will be lost.
  - You are about to drop the column `og_title` on the `Podcast` table. All the data in the column will be lost.
  - You are about to drop the column `origid` on the `Podcast` table. All the data in the column will be lost.
  - You are about to drop the column `published_date` on the `Podcast` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Podcast` table. All the data in the column will be lost.
  - You are about to drop the `_Podcast_tag` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[reason]` on the table `ReportReason` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_podcast_fkey";

-- DropForeignKey
ALTER TABLE "Pick" DROP CONSTRAINT "Pick_podcast_fkey";

-- DropForeignKey
ALTER TABLE "Podcast" DROP CONSTRAINT "Podcast_category_fkey";

-- DropForeignKey
ALTER TABLE "_Podcast_tag" DROP CONSTRAINT "_Podcast_tag_A_fkey";

-- DropForeignKey
ALTER TABLE "_Podcast_tag" DROP CONSTRAINT "_Podcast_tag_B_fkey";

-- DropIndex
DROP INDEX "Comment_podcast_idx";

-- DropIndex
DROP INDEX "Pick_podcast_idx";

-- DropIndex
DROP INDEX "Podcast_category_idx";

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "podcast";

-- AlterTable
ALTER TABLE "Pick" DROP COLUMN "podcast";

-- AlterTable
ALTER TABLE "Podcast" DROP COLUMN "author",
DROP COLUMN "category",
DROP COLUMN "description",
DROP COLUMN "duration",
DROP COLUMN "isMember",
DROP COLUMN "is_active",
DROP COLUMN "og_description",
DROP COLUMN "og_image",
DROP COLUMN "og_title",
DROP COLUMN "origid",
DROP COLUMN "published_date",
DROP COLUMN "title",
ADD COLUMN     "document" INTEGER;

-- AlterTable
ALTER TABLE "Story" ADD COLUMN     "podcast_src" INTEGER,
ADD COLUMN     "story_type" TEXT DEFAULT E'story';

-- DropTable
DROP TABLE "_Podcast_tag";

-- CreateIndex
CREATE INDEX "Podcast_document_idx" ON "Podcast"("document");

-- CreateIndex
CREATE UNIQUE INDEX "ReportReason_reason_key" ON "ReportReason"("reason");

-- CreateIndex
CREATE INDEX "Story_story_type_idx" ON "Story"("story_type");

-- CreateIndex
CREATE INDEX "Story_podcast_src_idx" ON "Story"("podcast_src");

-- AddForeignKey
ALTER TABLE "Story" ADD CONSTRAINT "Story_podcast_src_fkey" FOREIGN KEY ("podcast_src") REFERENCES "Podcast"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Podcast" ADD CONSTRAINT "Podcast_document_fkey" FOREIGN KEY ("document") REFERENCES "Story"("id") ON DELETE SET NULL ON UPDATE CASCADE;
