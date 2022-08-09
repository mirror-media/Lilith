/*
  Warnings:

  - The `customer_day` column on the `CollectionPick` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `customer_month` column on the `CollectionPick` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `customer_year` column on the `CollectionPick` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "CollectionPick" DROP COLUMN "customer_day",
ADD COLUMN     "customer_day" INTEGER,
DROP COLUMN "customer_month",
ADD COLUMN     "customer_month" INTEGER,
DROP COLUMN "customer_year",
ADD COLUMN     "customer_year" INTEGER;
