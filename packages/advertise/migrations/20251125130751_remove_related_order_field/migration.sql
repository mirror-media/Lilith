/*
  Warnings:

  - You are about to drop the column `relatedOrder` on the `Order` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_relatedOrder_fkey";

-- DropIndex
DROP INDEX "Order_relatedOrder_idx";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "relatedOrder";
