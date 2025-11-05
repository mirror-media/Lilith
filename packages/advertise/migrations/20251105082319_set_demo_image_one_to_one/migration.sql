/*
  Warnings:

  - You are about to drop the `_Order_demoImage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_Order_demoImage" DROP CONSTRAINT "_Order_demoImage_A_fkey";

-- DropForeignKey
ALTER TABLE "_Order_demoImage" DROP CONSTRAINT "_Order_demoImage_B_fkey";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "demoImage" INTEGER;

-- DropTable
DROP TABLE "_Order_demoImage";

-- CreateIndex
CREATE INDEX "Order_demoImage_idx" ON "Order"("demoImage");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_demoImage_fkey" FOREIGN KEY ("demoImage") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;
