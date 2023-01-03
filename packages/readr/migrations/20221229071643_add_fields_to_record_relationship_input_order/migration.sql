-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "manualOrderOfCameraOperators" JSONB,
ADD COLUMN     "manualOrderOfDataAnalysts" JSONB,
ADD COLUMN     "manualOrderOfDesigners" JSONB,
ADD COLUMN     "manualOrderOfEngineers" JSONB,
ADD COLUMN     "manualOrderOfPhotographers" JSONB,
ADD COLUMN     "manualOrderOfRelatedPosts" JSONB,
ADD COLUMN     "manualOrderOfWriters" JSONB;
