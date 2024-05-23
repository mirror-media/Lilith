-- AlterTable
ALTER TABLE "Story" ADD COLUMN     "trimApiData" JSONB,
ADD COLUMN     "trimContent" TEXT NOT NULL DEFAULT E'';
