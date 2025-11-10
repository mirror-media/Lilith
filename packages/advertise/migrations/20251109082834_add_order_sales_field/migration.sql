-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "sales" INTEGER;

-- CreateIndex
CREATE INDEX "Order_sales_idx" ON "Order"("sales");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_sales_fkey" FOREIGN KEY ("sales") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
