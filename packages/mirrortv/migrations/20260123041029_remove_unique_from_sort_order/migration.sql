-- DropIndex
DROP INDEX "Category_sortOrder_key";

-- AlterTable
ALTER TABLE "Category" ALTER COLUMN "sortOrder" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Category_sortOrder_idx" ON "Category"("sortOrder");
