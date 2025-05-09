/*
  Warnings:

  - Made the column `publishedDate` on table `Video` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "publishedDateString" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "updateTimeStamp" BOOLEAN NOT NULL DEFAULT false;
