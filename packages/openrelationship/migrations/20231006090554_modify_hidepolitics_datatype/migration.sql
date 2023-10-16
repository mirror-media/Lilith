/*
  Warnings:

  - The `hidePoliticDetail` column on the `Election` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Election" DROP COLUMN "hidePoliticDetail",
ADD COLUMN     "hidePoliticDetail" TIMESTAMP(3);
