/*
  Warnings:

  - You are about to drop the column `description` on the `AudioFile` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `AudioFile` table. All the data in the column will be lost.
  - You are about to drop the column `meta` on the `AudioFile` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `AudioFile` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `AudioFile` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `bio` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `facebook` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `homepage` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `instantgram` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `twitter` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `embed` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `video` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `createTime` on the `External` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `External` table. All the data in the column will be lost.
  - You are about to drop the column `subtitle` on the `External` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `External` table. All the data in the column will be lost.
  - You are about to drop the column `createTime` on the `Magazine` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Magazine` table. All the data in the column will be lost.
  - You are about to drop the column `issue` on the `Magazine` table. All the data in the column will be lost.
  - You are about to drop the column `display` on the `Partner` table. All the data in the column will be lost.
  - You are about to drop the column `createTime` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `device` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `isAudioSiteOnly` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `redirect` on the `Post` table. All the data in the column will be lost.
  - The `brief` column on the `Post` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `css` on the `Section` table. All the data in the column will be lost.
  - You are about to drop the column `isMemberOnly` on the `Section` table. All the data in the column will be lost.
  - You are about to drop the column `javascript` on the `Section` table. All the data in the column will be lost.
  - You are about to drop the column `og_description` on the `Section` table. All the data in the column will be lost.
  - You are about to drop the column `og_image` on the `Section` table. All the data in the column will be lost.
  - You are about to drop the column `og_title` on the `Section` table. All the data in the column will be lost.
  - You are about to drop the column `style` on the `Section` table. All the data in the column will be lost.
  - You are about to drop the column `timeline` on the `Section` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Section` table. All the data in the column will be lost.
  - You are about to drop the column `brief` on the `Tag` table. All the data in the column will be lost.
  - You are about to drop the column `css` on the `Tag` table. All the data in the column will be lost.
  - You are about to drop the column `heroImage` on the `Tag` table. All the data in the column will be lost.
  - You are about to drop the column `heroImageSize` on the `Tag` table. All the data in the column will be lost.
  - You are about to drop the column `heroVideo` on the `Tag` table. All the data in the column will be lost.
  - You are about to drop the column `isFeatured` on the `Tag` table. All the data in the column will be lost.
  - You are about to drop the column `javascript` on the `Tag` table. All the data in the column will be lost.
  - You are about to drop the column `og_description` on the `Tag` table. All the data in the column will be lost.
  - You are about to drop the column `og_image` on the `Tag` table. All the data in the column will be lost.
  - You are about to drop the column `og_title` on the `Tag` table. All the data in the column will be lost.
  - You are about to drop the column `uuid` on the `Tag` table. All the data in the column will be lost.
  - You are about to drop the column `heroVideo` on the `Topic` table. All the data in the column will be lost.
  - You are about to drop the column `og_description` on the `Topic` table. All the data in the column will be lost.
  - You are about to drop the column `og_image` on the `Topic` table. All the data in the column will be lost.
  - You are about to drop the column `og_title` on the `Topic` table. All the data in the column will be lost.
  - You are about to drop the column `sort` on the `Topic` table. All the data in the column will be lost.
  - You are about to drop the column `source` on the `Topic` table. All the data in the column will be lost.
  - You are about to drop the column `subtitle` on the `Topic` table. All the data in the column will be lost.
  - You are about to drop the column `uuid` on the `Topic` table. All the data in the column will be lost.
  - The `brief` column on the `Topic` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `coverPhoto` on the `Video` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Video` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `Video` table. All the data in the column will be lost.
  - You are about to drop the column `meta` on the `Video` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `Video` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `Video` table. All the data in the column will be lost.
  - You are about to drop the column `youtubeUrl` on the `Video` table. All the data in the column will be lost.
  - You are about to drop the `PostCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_EditorChoice_choices` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_Post_categories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_Section_categories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_Section_extend_cats` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[order]` on the table `EditorChoice` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `Event` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `External` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `Magazine` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `Partner` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `Section` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[order]` on the table `Section` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `Tag` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `state` to the `Section` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Contact" DROP CONSTRAINT "Contact_image_fkey";

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_image_fkey";

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_video_fkey";

-- DropForeignKey
ALTER TABLE "PostCategory" DROP CONSTRAINT "PostCategory_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "PostCategory" DROP CONSTRAINT "PostCategory_heroImage_fkey";

-- DropForeignKey
ALTER TABLE "PostCategory" DROP CONSTRAINT "PostCategory_og_image_fkey";

-- DropForeignKey
ALTER TABLE "PostCategory" DROP CONSTRAINT "PostCategory_updatedBy_fkey";

-- DropForeignKey
ALTER TABLE "Section" DROP CONSTRAINT "Section_og_image_fkey";

-- DropForeignKey
ALTER TABLE "Tag" DROP CONSTRAINT "Tag_heroImage_fkey";

-- DropForeignKey
ALTER TABLE "Tag" DROP CONSTRAINT "Tag_heroVideo_fkey";

-- DropForeignKey
ALTER TABLE "Tag" DROP CONSTRAINT "Tag_og_image_fkey";

-- DropForeignKey
ALTER TABLE "Topic" DROP CONSTRAINT "Topic_heroVideo_fkey";

-- DropForeignKey
ALTER TABLE "Topic" DROP CONSTRAINT "Topic_og_image_fkey";

-- DropForeignKey
ALTER TABLE "Video" DROP CONSTRAINT "Video_coverPhoto_fkey";

-- DropForeignKey
ALTER TABLE "_EditorChoice_choices" DROP CONSTRAINT "_EditorChoice_choices_A_fkey";

-- DropForeignKey
ALTER TABLE "_EditorChoice_choices" DROP CONSTRAINT "_EditorChoice_choices_B_fkey";

-- DropForeignKey
ALTER TABLE "_Post_categories" DROP CONSTRAINT "_Post_categories_A_fkey";

-- DropForeignKey
ALTER TABLE "_Post_categories" DROP CONSTRAINT "_Post_categories_B_fkey";

-- DropForeignKey
ALTER TABLE "_Section_categories" DROP CONSTRAINT "_Section_categories_A_fkey";

-- DropForeignKey
ALTER TABLE "_Section_categories" DROP CONSTRAINT "_Section_categories_B_fkey";

-- DropForeignKey
ALTER TABLE "_Section_extend_cats" DROP CONSTRAINT "_Section_extend_cats_A_fkey";

-- DropForeignKey
ALTER TABLE "_Section_extend_cats" DROP CONSTRAINT "_Section_extend_cats_B_fkey";

-- DropIndex
DROP INDEX "Contact_email_key";

-- DropIndex
DROP INDEX "Contact_image_idx";

-- DropIndex
DROP INDEX "Contact_instantgram_idx";

-- DropIndex
DROP INDEX "Event_image_idx";

-- DropIndex
DROP INDEX "Event_video_idx";

-- DropIndex
DROP INDEX "External_name_key";

-- DropIndex
DROP INDEX "Partner_display_idx";

-- DropIndex
DROP INDEX "Post_device_idx";

-- DropIndex
DROP INDEX "Section_og_image_idx";

-- DropIndex
DROP INDEX "Tag_heroImage_idx";

-- DropIndex
DROP INDEX "Tag_heroVideo_idx";

-- DropIndex
DROP INDEX "Tag_og_image_idx";

-- DropIndex
DROP INDEX "Topic_heroVideo_idx";

-- DropIndex
DROP INDEX "Topic_og_image_idx";

-- DropIndex
DROP INDEX "Video_coverPhoto_idx";

-- AlterTable
ALTER TABLE "AudioFile" DROP COLUMN "description",
DROP COLUMN "duration",
DROP COLUMN "meta",
DROP COLUMN "tags",
DROP COLUMN "url",
ADD COLUMN     "apiData" JSONB,
ADD COLUMN     "content" JSONB,
ADD COLUMN     "heroImage" INTEGER;

-- AlterTable
ALTER TABLE "Contact" DROP COLUMN "address",
DROP COLUMN "bio",
DROP COLUMN "email",
DROP COLUMN "facebook",
DROP COLUMN "homepage",
DROP COLUMN "image",
DROP COLUMN "instantgram",
DROP COLUMN "twitter",
ADD COLUMN     "content" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "EditorChoice" ADD COLUMN     "choices" INTEGER,
ADD COLUMN     "order" INTEGER,
ADD COLUMN     "publishedDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "embed",
DROP COLUMN "image",
DROP COLUMN "video",
ADD COLUMN     "heroImage" INTEGER,
ADD COLUMN     "slug" TEXT NOT NULL DEFAULT '',
ALTER COLUMN "state" SET DEFAULT 'now';

-- AlterTable
ALTER TABLE "External" DROP COLUMN "createTime",
DROP COLUMN "name",
DROP COLUMN "subtitle",
DROP COLUMN "title",
ADD COLUMN     "slug" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Image" ADD COLUMN     "copyRight" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Magazine" DROP COLUMN "createTime",
DROP COLUMN "description",
DROP COLUMN "issue",
ADD COLUMN     "pdfFile_filename" TEXT,
ADD COLUMN     "pdfFile_filesize" INTEGER,
ADD COLUMN     "pdfFile_mode" TEXT,
ADD COLUMN     "slug" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Partner" DROP COLUMN "display",
ADD COLUMN     "slug" TEXT NOT NULL DEFAULT '',
ALTER COLUMN "public" SET DEFAULT true;

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "createTime",
DROP COLUMN "device",
DROP COLUMN "isAudioSiteOnly",
DROP COLUMN "redirect",
ADD COLUMN     "apiDataBrief" JSONB,
DROP COLUMN "brief",
ADD COLUMN     "brief" JSONB,
ALTER COLUMN "titleColor" SET DEFAULT 'light';

-- AlterTable
ALTER TABLE "Section" DROP COLUMN "css",
DROP COLUMN "isMemberOnly",
DROP COLUMN "javascript",
DROP COLUMN "og_description",
DROP COLUMN "og_image",
DROP COLUMN "og_title",
DROP COLUMN "style",
DROP COLUMN "timeline",
DROP COLUMN "title",
ADD COLUMN     "order" INTEGER,
ADD COLUMN     "slug" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "state" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Tag" DROP COLUMN "brief",
DROP COLUMN "css",
DROP COLUMN "heroImage",
DROP COLUMN "heroImageSize",
DROP COLUMN "heroVideo",
DROP COLUMN "isFeatured",
DROP COLUMN "javascript",
DROP COLUMN "og_description",
DROP COLUMN "og_image",
DROP COLUMN "og_title",
DROP COLUMN "uuid",
ADD COLUMN     "slug" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Topic" DROP COLUMN "heroVideo",
DROP COLUMN "og_description",
DROP COLUMN "og_image",
DROP COLUMN "og_title",
DROP COLUMN "sort",
DROP COLUMN "source",
DROP COLUMN "subtitle",
DROP COLUMN "uuid",
ADD COLUMN     "sortOrder" INTEGER,
DROP COLUMN "brief",
ADD COLUMN     "brief" JSONB;

-- AlterTable
ALTER TABLE "Video" DROP COLUMN "coverPhoto",
DROP COLUMN "description",
DROP COLUMN "duration",
DROP COLUMN "meta",
DROP COLUMN "tags",
DROP COLUMN "url",
DROP COLUMN "youtubeUrl",
ADD COLUMN     "apiData" JSONB,
ADD COLUMN     "content" JSONB,
ADD COLUMN     "heroImage" INTEGER,
ADD COLUMN     "isFeed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "publishedDate" TIMESTAMP(3),
ADD COLUMN     "state" TEXT DEFAULT 'draft';

-- DropTable
DROP TABLE "PostCategory";

-- DropTable
DROP TABLE "_EditorChoice_choices";

-- DropTable
DROP TABLE "_Post_categories";

-- DropTable
DROP TABLE "_Section_categories";

-- DropTable
DROP TABLE "_Section_extend_cats";

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "slug" TEXT NOT NULL DEFAULT '',
    "order" INTEGER,
    "state" TEXT NOT NULL,
    "heroImage" INTEGER,
    "sections" INTEGER,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_Video_tags" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_AudioFile_tags" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Category_posts" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Category_order_key" ON "Category"("order");

-- CreateIndex
CREATE INDEX "Category_heroImage_idx" ON "Category"("heroImage");

-- CreateIndex
CREATE INDEX "Category_sections_idx" ON "Category"("sections");

-- CreateIndex
CREATE INDEX "Category_createdBy_idx" ON "Category"("createdBy");

-- CreateIndex
CREATE INDEX "Category_updatedBy_idx" ON "Category"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "_Video_tags_AB_unique" ON "_Video_tags"("A", "B");

-- CreateIndex
CREATE INDEX "_Video_tags_B_index" ON "_Video_tags"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AudioFile_tags_AB_unique" ON "_AudioFile_tags"("A", "B");

-- CreateIndex
CREATE INDEX "_AudioFile_tags_B_index" ON "_AudioFile_tags"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Category_posts_AB_unique" ON "_Category_posts"("A", "B");

-- CreateIndex
CREATE INDEX "_Category_posts_B_index" ON "_Category_posts"("B");

-- CreateIndex
CREATE INDEX "AudioFile_heroImage_idx" ON "AudioFile"("heroImage");

-- CreateIndex
CREATE UNIQUE INDEX "EditorChoice_order_key" ON "EditorChoice"("order");

-- CreateIndex
CREATE INDEX "EditorChoice_choices_idx" ON "EditorChoice"("choices");

-- CreateIndex
CREATE INDEX "EditorChoice_publishedDate_idx" ON "EditorChoice"("publishedDate");

-- CreateIndex
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");

-- CreateIndex
CREATE INDEX "Event_heroImage_idx" ON "Event"("heroImage");

-- CreateIndex
CREATE UNIQUE INDEX "External_slug_key" ON "External"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Magazine_slug_key" ON "Magazine"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Partner_slug_key" ON "Partner"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Section_slug_key" ON "Section"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Section_order_key" ON "Section"("order");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_slug_key" ON "Tag"("slug");

-- CreateIndex
CREATE INDEX "Video_heroImage_idx" ON "Video"("heroImage");

-- CreateIndex
CREATE INDEX "Video_state_idx" ON "Video"("state");

-- CreateIndex
CREATE INDEX "Video_publishedDate_idx" ON "Video"("publishedDate");

-- AddForeignKey
ALTER TABLE "EditorChoice" ADD CONSTRAINT "EditorChoice_choices_fkey" FOREIGN KEY ("choices") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_heroImage_fkey" FOREIGN KEY ("heroImage") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AudioFile" ADD CONSTRAINT "AudioFile_heroImage_fkey" FOREIGN KEY ("heroImage") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_heroImage_fkey" FOREIGN KEY ("heroImage") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_heroImage_fkey" FOREIGN KEY ("heroImage") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_sections_fkey" FOREIGN KEY ("sections") REFERENCES "Section"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Video_tags" ADD CONSTRAINT "_Video_tags_A_fkey" FOREIGN KEY ("A") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Video_tags" ADD CONSTRAINT "_Video_tags_B_fkey" FOREIGN KEY ("B") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AudioFile_tags" ADD CONSTRAINT "_AudioFile_tags_A_fkey" FOREIGN KEY ("A") REFERENCES "AudioFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AudioFile_tags" ADD CONSTRAINT "_AudioFile_tags_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Category_posts" ADD CONSTRAINT "_Category_posts_A_fkey" FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Category_posts" ADD CONSTRAINT "_Category_posts_B_fkey" FOREIGN KEY ("B") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
