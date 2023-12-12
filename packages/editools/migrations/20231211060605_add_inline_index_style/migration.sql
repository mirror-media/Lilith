-- AlterTable
ALTER TABLE "FullScene" ALTER COLUMN "hotspotJson" SET DEFAULT '[]';

-- AlterTable
ALTER TABLE "InlineIndex" ADD COLUMN     "style" TEXT;
