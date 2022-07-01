-- AlterTable
ALTER TABLE "Category" ALTER COLUMN "weight" SET DEFAULT 3;

-- AlterTable
ALTER TABLE "Classify" ALTER COLUMN "weight" SET DEFAULT 3;

-- AlterTable
ALTER TABLE "Influence" ADD COLUMN     "desc" TEXT NOT NULL DEFAULT E'';
