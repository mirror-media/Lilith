/*
  Warnings:

  - You are about to drop the column `file_mode` on the `AudioFile` table. All the data in the column will be lost.
  - You are about to drop the column `file_mode` on the `Image` table. All the data in the column will be lost.
  - You are about to drop the column `imageFile_mode` on the `Image` table. All the data in the column will be lost.
  - You are about to drop the column `file_mode` on the `Video` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AudioFile" DROP COLUMN "file_mode";

-- AlterTable
ALTER TABLE "Image" DROP COLUMN "file_mode",
DROP COLUMN "imageFile_mode";

-- AlterTable
ALTER TABLE "Video" DROP COLUMN "file_mode";
