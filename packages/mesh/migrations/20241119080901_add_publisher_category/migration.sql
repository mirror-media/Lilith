-- AlterTable
ALTER TABLE "Publisher" ADD COLUMN     "category" INTEGER;

-- CreateIndex
CREATE INDEX "Publisher_category_idx" ON "Publisher"("category");

-- AddForeignKey
ALTER TABLE "Publisher" ADD CONSTRAINT "Publisher_category_fkey" FOREIGN KEY ("category") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
