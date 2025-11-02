/*
  Warnings:

  - Made the column `paragraphOne` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Made the column `paragraphTwo` on table `Order` required. This step will fail if there are existing NULL values in that column.

*/
-- Update existing NULL values to empty string before making columns NOT NULL
UPDATE "Order" SET "paragraphOne" = '' WHERE "paragraphOne" IS NULL;
UPDATE "Order" SET "paragraphTwo" = '' WHERE "paragraphTwo" IS NULL;

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "paragraphOne" SET NOT NULL,
ALTER COLUMN "paragraphOne" SET DEFAULT '',
ALTER COLUMN "paragraphTwo" SET NOT NULL,
ALTER COLUMN "paragraphTwo" SET DEFAULT '';
