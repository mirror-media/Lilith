/*
  Warnings:

  - You are about to drop the column `file_filename` on the `Image` table. All the data in the column will be lost.
  - You are about to drop the column `file_filesize` on the `Image` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Image" DROP COLUMN "file_filename",
DROP COLUMN "file_filesize";
