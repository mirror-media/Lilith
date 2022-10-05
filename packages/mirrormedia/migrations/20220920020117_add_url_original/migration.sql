-- AlterTable
ALTER TABLE "AudioFile" ADD COLUMN     "urlOriginal" TEXT NOT NULL DEFAULT E'';

-- AlterTable
ALTER TABLE "Magazine" ADD COLUMN     "urlOriginal" TEXT NOT NULL DEFAULT E'';

-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "urlOriginal" TEXT NOT NULL DEFAULT E'';
