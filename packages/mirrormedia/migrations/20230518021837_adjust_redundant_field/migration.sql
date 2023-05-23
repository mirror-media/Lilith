/*
  Warnings:

  - You are about to drop the column `heroImageSize` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `isCampaign` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `lockJS` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `subtitle` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `titleColor` on the `Post` table. All the data in the column will be lost.
  - Made the column `publishedDate` on table `Post` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Post" DROP COLUMN "heroImageSize",
DROP COLUMN "isCampaign",
DROP COLUMN "lockJS",
DROP COLUMN "subtitle",
DROP COLUMN "titleColor",
ALTER COLUMN "publishedDate" SET NOT NULL;

-- AlterTable
ALTER TABLE "Topic" ADD COLUMN     "slug" TEXT NOT NULL DEFAULT E'';
