/*
  Warnings:

  - You are about to drop the column `previewButton` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `previewButton` on the `LatestNew` table. All the data in the column will be lost.
  - You are about to drop the column `postPreviewButton` on the `Post` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "previewButton";

-- AlterTable
ALTER TABLE "LatestNew" DROP COLUMN "previewButton";

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "postPreviewButton";
