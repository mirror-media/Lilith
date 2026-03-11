-- AlterTable
ALTER TABLE "ArtShow" ADD COLUMN     "manualOrderOfAuthors" JSONB;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "manualOrderOfCameraOperators" JSONB,
ADD COLUMN     "manualOrderOfDesigners" JSONB,
ADD COLUMN     "manualOrderOfEngineers" JSONB,
ADD COLUMN     "manualOrderOfPhotographers" JSONB,
ADD COLUMN     "manualOrderOfVocals" JSONB;

-- AlterTable
ALTER TABLE "Show" ADD COLUMN     "manualOrderOfHostNames" JSONB;
