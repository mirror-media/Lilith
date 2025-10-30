/*
  Warnings:

  - You are about to drop the `_Order_relatedOrder` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_Order_relatedOrder" DROP CONSTRAINT "_Order_relatedOrder_A_fkey";

-- DropForeignKey
ALTER TABLE "_Order_relatedOrder" DROP CONSTRAINT "_Order_relatedOrder_B_fkey";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "relatedOrder" INTEGER;

-- DropTable
DROP TABLE "_Order_relatedOrder";

-- CreateIndex
CREATE INDEX "Order_relatedOrder_idx" ON "Order"("relatedOrder");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_relatedOrder_fkey" FOREIGN KEY ("relatedOrder") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
