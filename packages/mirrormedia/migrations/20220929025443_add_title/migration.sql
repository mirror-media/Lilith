-- AlterTable
ALTER TABLE "Category" ALTER COLUMN "state" SET DEFAULT E'active';

-- AlterTable
ALTER TABLE "External" ADD COLUMN     "title" TEXT NOT NULL DEFAULT E'';

-- AlterTable
ALTER TABLE "Section" ALTER COLUMN "state" SET DEFAULT E'active';
