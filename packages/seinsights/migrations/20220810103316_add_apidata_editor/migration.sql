-- AlterTable
ALTER TABLE "Column" ADD COLUMN     "apiData" JSONB,
ALTER COLUMN "intro" DROP NOT NULL,
ALTER COLUMN "intro" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "apiData" JSONB,
ALTER COLUMN "content" DROP NOT NULL,
ALTER COLUMN "content" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "apiData" JSONB,
ALTER COLUMN "content" DROP NOT NULL,
ALTER COLUMN "content" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Post" ALTER COLUMN "content" DROP NOT NULL,
ALTER COLUMN "content" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Resource" ADD COLUMN     "apiData" JSONB,
ALTER COLUMN "content" DROP NOT NULL,
ALTER COLUMN "content" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Specialfeature" ADD COLUMN     "apiData" JSONB,
ALTER COLUMN "content" DROP NOT NULL,
ALTER COLUMN "content" DROP DEFAULT;

-- AlterTable
ALTER TABLE "SpecialfeatureList" ADD COLUMN     "apiData" JSONB,
ALTER COLUMN "content" DROP NOT NULL,
ALTER COLUMN "content" DROP DEFAULT;
