/*
  Warnings:

  - You are about to drop the column `file_filename` on the `Image` table. All the data in the column will be lost.

*/

-- AlterTable
ALTER TABLE "Announcement" ADD COLUMN     "type" TEXT DEFAULT E'features';

-- AlterTable
ALTER TABLE "Image" DROP COLUMN "file_filename",
ADD COLUMN     "file_extension" TEXT,
ADD COLUMN     "file_height" INTEGER,
ADD COLUMN     "file_id" TEXT,
ADD COLUMN     "file_width" INTEGER;
