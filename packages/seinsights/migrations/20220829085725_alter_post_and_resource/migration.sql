-- CreateEnum
CREATE TYPE "ResourceStatusType" AS ENUM ('published', 'draft', 'scheduled', 'archived');

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "apiDataBrief" JSONB;

-- AlterTable
ALTER TABLE "Resource" ADD COLUMN     "status" "ResourceStatusType" NOT NULL DEFAULT 'draft';
