-- AlterTable
ALTER TABLE "Theatre" ADD COLUMN     "mobileAnimationJson" JSONB,
ADD COLUMN     "mobileObjectJson" JSONB,
ADD COLUMN     "mobileWidth" TEXT DEFAULT '768';
