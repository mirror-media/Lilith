-- AlterTable
ALTER TABLE "PoliticTimeline" ADD COLUMN     "checked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reviewed" BOOLEAN NOT NULL DEFAULT false;
