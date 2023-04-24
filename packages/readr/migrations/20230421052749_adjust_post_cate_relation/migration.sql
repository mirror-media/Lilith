/*
  Warnings:

  - You are about to drop the column `url` on the `AudioFile` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `Video` table. All the data in the column will be lost.
  - You are about to drop the `_Post_categories` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_Post_categories" DROP CONSTRAINT "_Post_categories_A_fkey";

-- DropForeignKey
ALTER TABLE "_Post_categories" DROP CONSTRAINT "_Post_categories_B_fkey";

-- AlterTable
ALTER TABLE "AudioFile" DROP COLUMN "url";

-- AlterTable
ALTER TABLE "Video" DROP COLUMN "url";

-- DropTable
DROP TABLE "_Post_categories";
