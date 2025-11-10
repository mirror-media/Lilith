/*
  Warnings:

  - You are about to drop the column `sales` on the `Order` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_sales_fkey";

-- DropIndex
DROP INDEX "Order_sales_idx";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "sales";
