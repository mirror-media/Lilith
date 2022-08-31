/*
  Warnings:

  - You are about to drop the column `loaction` on the `Job` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Job" DROP COLUMN "loaction",
ADD COLUMN     "location" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Resource" ADD COLUMN     "apiDataContact" JSONB,
ADD COLUMN     "apiDataLink" JSONB,
ADD COLUMN     "contact" JSONB,
ADD COLUMN     "link" JSONB,
ALTER COLUMN "region" DROP NOT NULL;
