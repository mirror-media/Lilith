/*
  Warnings:

  - Made the column `paragraphOne` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Made the column `paragraphTwo` on table `Order` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "paragraphOne" SET NOT NULL,
ALTER COLUMN "paragraphOne" SET DEFAULT '',
ALTER COLUMN "paragraphTwo" SET NOT NULL,
ALTER COLUMN "paragraphTwo" SET DEFAULT '';
