-- AlterEnum
ALTER TYPE "EventRegionType" ADD VALUE 'UK';

-- AlterEnum
ALTER TYPE "JobRegionType" ADD VALUE 'UK';

-- AlterEnum
ALTER TYPE "ResourceRegionType" ADD VALUE 'UK';

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "location" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "organization" TEXT NOT NULL DEFAULT '',
ALTER COLUMN "eventStatus" DROP NOT NULL,
ALTER COLUMN "type" DROP NOT NULL,
ALTER COLUMN "region" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "loaction" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "official_website" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "official_website_titile" TEXT NOT NULL DEFAULT '',
ALTER COLUMN "jobStatus" DROP NOT NULL,
ALTER COLUMN "type" DROP NOT NULL,
ALTER COLUMN "region" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "oldCategory" TEXT,
ADD COLUMN     "region" TEXT;
