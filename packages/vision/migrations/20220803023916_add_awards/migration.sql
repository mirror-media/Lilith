/*
  Warnings:

  - You are about to drop the column `isHomepage` on the `InfoGraph` table. All the data in the column will be lost.
  - You are about to drop the column `active` on the `LatestNew` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Poll` table. All the data in the column will be lost.
  - You are about to drop the `_Poll_options` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Longform` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[subtitle]` on the table `Longform` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `Post` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "_Poll_options" DROP CONSTRAINT "_Poll_options_A_fkey";

-- DropForeignKey
ALTER TABLE "_Poll_options" DROP CONSTRAINT "_Poll_options_B_fkey";

-- AlterTable
ALTER TABLE "InfoGraph" DROP COLUMN "isHomepage";

-- AlterTable
ALTER TABLE "LatestNew" DROP COLUMN "active";

-- AlterTable
ALTER TABLE "Longform" ADD COLUMN     "reporter" TEXT NOT NULL DEFAULT E'',
ADD COLUMN     "slug" TEXT NOT NULL DEFAULT E'';

-- AlterTable
ALTER TABLE "Poll" DROP COLUMN "description",
ALTER COLUMN "startTime" DROP NOT NULL,
ALTER COLUMN "endTime" DROP NOT NULL,
ALTER COLUMN "publishTime" DROP NOT NULL,
ALTER COLUMN "publishTime" DROP DEFAULT;

-- AlterTable
ALTER TABLE "PollOption" ADD COLUMN     "poll" INTEGER;

-- DropTable
DROP TABLE "_Poll_options";

-- CreateTable
CREATE TABLE "Award" (
    "id" SERIAL NOT NULL,
    "year" TEXT DEFAULT E'2022',
    "name" TEXT NOT NULL DEFAULT E'',
    "report" TEXT NOT NULL DEFAULT E'',
    "url" TEXT NOT NULL DEFAULT E'',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Award_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Award_createdBy_idx" ON "Award"("createdBy");

-- CreateIndex
CREATE INDEX "Award_updatedBy_idx" ON "Award"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "Longform_slug_key" ON "Longform"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Longform_subtitle_key" ON "Longform"("subtitle");

-- CreateIndex
CREATE INDEX "PollOption_poll_idx" ON "PollOption"("poll");

-- CreateIndex
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");

-- AddForeignKey
ALTER TABLE "PollOption" ADD CONSTRAINT "PollOption_poll_fkey" FOREIGN KEY ("poll") REFERENCES "Poll"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Award" ADD CONSTRAINT "Award_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Award" ADD CONSTRAINT "Award_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
