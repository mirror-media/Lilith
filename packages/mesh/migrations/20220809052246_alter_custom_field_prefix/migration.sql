/*
  Warnings:

  - You are about to drop the column `customer_day` on the `CollectionPick` table. All the data in the column will be lost.
  - You are about to drop the column `customer_month` on the `CollectionPick` table. All the data in the column will be lost.
  - You are about to drop the column `customer_year` on the `CollectionPick` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CollectionPick" DROP COLUMN "customer_day",
DROP COLUMN "customer_month",
DROP COLUMN "customer_year",
ADD COLUMN     "custom_day" INTEGER,
ADD COLUMN     "custom_month" INTEGER,
ADD COLUMN     "custom_year" INTEGER;
