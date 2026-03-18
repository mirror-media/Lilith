-- AlterTable
ALTER TABLE "Contact" ADD COLUMN     "manualOrderOfRelatedSeries" JSONB,
ADD COLUMN     "manualOrderOfRelatedShows" JSONB;

-- AlterTable
ALTER TABLE "Topic" ADD COLUMN     "manualOrderOfCategories" JSONB,
ADD COLUMN     "manualOrderOfMultivideos" JSONB,
ADD COLUMN     "manualOrderOfPosts" JSONB,
ADD COLUMN     "manualOrderOfSlideshows" JSONB,
ADD COLUMN     "manualOrderOfTags" JSONB;

-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "manualOrderOfCategories" JSONB,
ADD COLUMN     "manualOrderOfRelatedPosts" JSONB,
ADD COLUMN     "manualOrderOfTags" JSONB;
