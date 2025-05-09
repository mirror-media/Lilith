/*
  Warnings:

  - Made the column `publishedDate` on table `Video` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Video" ALTER COLUMN "publishedDate" SET NULL;
