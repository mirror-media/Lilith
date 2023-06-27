/*
  Warnings:

  - You are about to drop the column `file_mode` on the `AudioFile` table. All the data in the column will be lost.
  - You are about to drop the column `file_filename` on the `Image` table. All the data in the column will be lost.
  - You are about to drop the column `file_filesize` on the `Image` table. All the data in the column will be lost.
  - You are about to drop the column `file_mode` on the `Image` table. All the data in the column will be lost.
  - You are about to drop the column `imageFile_mode` on the `Image` table. All the data in the column will be lost.
  - You are about to drop the column `imageFile_mode` on the `IndexItem` table. All the data in the column will be lost.
  - You are about to drop the column `audio_mode` on the `Karaoke` table. All the data in the column will be lost.
  - You are about to drop the column `imageFile_mode` on the `Karaoke` table. All the data in the column will be lost.
  - You are about to drop the column `button_mode` on the `RandomTextSelector` table. All the data in the column will be lost.
  - You are about to drop the column `highlightDesktop_mode` on the `RandomTextSelector` table. All the data in the column will be lost.
  - You are about to drop the column `highlightMobile_mode` on the `RandomTextSelector` table. All the data in the column will be lost.
  - You are about to drop the column `loadingIcon_mode` on the `RandomTextSelector` table. All the data in the column will be lost.
  - You are about to drop the column `desktopModel_mode` on the `ThreeStoryPoint` table. All the data in the column will be lost.
  - You are about to drop the column `lightModel_mode` on the `ThreeStoryPoint` table. All the data in the column will be lost.
  - You are about to drop the column `model_mode` on the `ThreeStoryPoint` table. All the data in the column will be lost.
  - You are about to drop the column `file_mode` on the `Video` table. All the data in the column will be lost.
  - You are about to drop the column `video1280_mode` on the `VideoPicker` table. All the data in the column will be lost.
  - You are about to drop the column `video1440_mode` on the `VideoPicker` table. All the data in the column will be lost.
  - You are about to drop the column `video1920_mode` on the `VideoPicker` table. All the data in the column will be lost.
  - You are about to drop the column `video720_mode` on the `VideoPicker` table. All the data in the column will be lost.
  - You are about to drop the column `video960_mode` on the `VideoPicker` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AudioFile" DROP COLUMN "file_mode";

-- AlterTable
ALTER TABLE "Image" DROP COLUMN "file_filename",
DROP COLUMN "file_filesize",
DROP COLUMN "file_mode",
DROP COLUMN "imageFile_mode";

-- AlterTable
ALTER TABLE "IndexItem" DROP COLUMN "imageFile_mode";

-- AlterTable
ALTER TABLE "Karaoke" DROP COLUMN "audio_mode",
DROP COLUMN "imageFile_mode";

-- AlterTable
ALTER TABLE "RandomTextSelector" DROP COLUMN "button_mode",
DROP COLUMN "highlightDesktop_mode",
DROP COLUMN "highlightMobile_mode",
DROP COLUMN "loadingIcon_mode";

-- AlterTable
ALTER TABLE "ThreeStoryPoint" DROP COLUMN "desktopModel_mode",
DROP COLUMN "lightModel_mode",
DROP COLUMN "model_mode";

-- AlterTable
ALTER TABLE "Video" DROP COLUMN "file_mode";

-- AlterTable
ALTER TABLE "VideoPicker" DROP COLUMN "video1280_mode",
DROP COLUMN "video1440_mode",
DROP COLUMN "video1920_mode",
DROP COLUMN "video720_mode",
DROP COLUMN "video960_mode";
