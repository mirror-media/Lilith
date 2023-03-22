/*
  Warnings:

  - You are about to drop the column `video920_filename` on the `VideoPicker` table. All the data in the column will be lost.
  - You are about to drop the column `video920_filesize` on the `VideoPicker` table. All the data in the column will be lost.
  - You are about to drop the column `video920_mode` on the `VideoPicker` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "VideoPicker" DROP COLUMN "video920_filename",
DROP COLUMN "video920_filesize",
DROP COLUMN "video920_mode",
ADD COLUMN     "hintMode" TEXT DEFAULT E'light',
ADD COLUMN     "video960_filename" TEXT,
ADD COLUMN     "video960_filesize" INTEGER,
ADD COLUMN     "video960_mode" TEXT;
