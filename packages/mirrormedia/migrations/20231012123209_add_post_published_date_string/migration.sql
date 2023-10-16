-- AlterTable
ALTER TABLE "External" ADD COLUMN     "publishedDateString" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "publishedDateString" TEXT NOT NULL DEFAULT '';
