/*
  Warnings:

  - The `mobileWidth` column on the `Theatre` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Theatre" DROP COLUMN "mobileWidth",
ADD COLUMN     "mobileWidth" INTEGER DEFAULT 768;
