/*
  Warnings:

  - You are about to drop the column `author` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `data` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `designer` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `engineer` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `headLogo` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `heroMob` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `photographer` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `subtitle` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `subtitleColor` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `subtitleSize` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `titleColor` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `titleSize` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `video` on the `Post` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_headLogo_fkey";

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_heroMob_fkey";

-- DropIndex
DROP INDEX "Post_headLogo_idx";

-- DropIndex
DROP INDEX "Post_heroMob_idx";

-- DropIndex
-- DROP INDEX "Post_slug_key";

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "author",
DROP COLUMN "data",
DROP COLUMN "designer",
DROP COLUMN "engineer",
DROP COLUMN "headLogo",
DROP COLUMN "heroMob",
DROP COLUMN "photographer",
DROP COLUMN "slug",
DROP COLUMN "subtitle",
DROP COLUMN "subtitleColor",
DROP COLUMN "subtitleSize",
DROP COLUMN "titleColor",
DROP COLUMN "titleSize",
DROP COLUMN "video",
ADD COLUMN     "longform" INTEGER;

-- CreateTable
CREATE TABLE "Longform" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL DEFAULT E'',
    "titleSize" INTEGER,
    "titleColor" TEXT NOT NULL DEFAULT E'#000',
    "subtitle" TEXT NOT NULL DEFAULT E'',
    "subtitleSize" INTEGER,
    "subtitleColor" TEXT NOT NULL DEFAULT E'#000',
    "headLogo" INTEGER,
    "heroMob" INTEGER,
    "author" TEXT NOT NULL DEFAULT E'',
    "photographer" TEXT NOT NULL DEFAULT E'',
    "video" TEXT NOT NULL DEFAULT E'',
    "designer" TEXT NOT NULL DEFAULT E'',
    "engineer" TEXT NOT NULL DEFAULT E'',
    "data" TEXT NOT NULL DEFAULT E'',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Longform_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Longform_slug_key" ON "Longform"("slug");

-- CreateIndex
CREATE INDEX "Longform_headLogo_idx" ON "Longform"("headLogo");

-- CreateIndex
CREATE INDEX "Longform_heroMob_idx" ON "Longform"("heroMob");

-- CreateIndex
CREATE INDEX "Longform_createdBy_idx" ON "Longform"("createdBy");

-- CreateIndex
CREATE INDEX "Longform_updatedBy_idx" ON "Longform"("updatedBy");

-- CreateIndex
CREATE INDEX "Post_longform_idx" ON "Post"("longform");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_longform_fkey" FOREIGN KEY ("longform") REFERENCES "Longform"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Longform" ADD CONSTRAINT "Longform_headLogo_fkey" FOREIGN KEY ("headLogo") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Longform" ADD CONSTRAINT "Longform_heroMob_fkey" FOREIGN KEY ("heroMob") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Longform" ADD CONSTRAINT "Longform_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Longform" ADD CONSTRAINT "Longform_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
