/*
  Warnings:

  - You are about to drop the column `demoImage` on the `Order` table. All the data in the column will be lost.

*/
-- CreateTable (create first to migrate data)
CREATE TABLE "_Order_demoImage" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- Migrate existing data from old one-to-one relationship to new many-to-many relationship
INSERT INTO "_Order_demoImage" ("A", "B")
SELECT "id", "demoImage"
FROM "Order"
WHERE "demoImage" IS NOT NULL;

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_demoImage_fkey";

-- DropIndex
DROP INDEX "Order_demoImage_idx";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "demoImage";

-- CreateIndex
CREATE UNIQUE INDEX "_Order_demoImage_AB_unique" ON "_Order_demoImage"("A", "B");

-- CreateIndex
CREATE INDEX "_Order_demoImage_B_index" ON "_Order_demoImage"("B");

-- AddForeignKey
ALTER TABLE "_Order_demoImage" ADD CONSTRAINT "_Order_demoImage_A_fkey" FOREIGN KEY ("A") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Order_demoImage" ADD CONSTRAINT "_Order_demoImage_B_fkey" FOREIGN KEY ("B") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;
