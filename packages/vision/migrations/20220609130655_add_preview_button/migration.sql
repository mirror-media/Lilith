-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "previewButton" TEXT NOT NULL DEFAULT E'';

-- AlterTable
ALTER TABLE "LatestNew" ADD COLUMN     "previewButton" TEXT NOT NULL DEFAULT E'';

-- AlterTable
ALTER TABLE "Post" ALTER COLUMN "weight" SET DEFAULT 85;
