-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "manualOrderOfRelateds" JSONB,
ADD COLUMN     "manualOrderOfSections" JSONB,
ADD COLUMN     "manualOrderOfWriters" JSONB;
