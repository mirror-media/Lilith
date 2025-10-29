-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "attachment" INTEGER;

-- CreateIndex
CREATE INDEX "Order_attachment_idx" ON "Order"("attachment");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_attachment_fkey" FOREIGN KEY ("attachment") REFERENCES "Pdf"("id") ON DELETE SET NULL ON UPDATE CASCADE;
