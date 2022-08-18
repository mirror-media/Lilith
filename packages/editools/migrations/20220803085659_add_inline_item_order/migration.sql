/*
  Warnings:

  - Added the required column `order` to the `IndexItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "IndexItem" ADD COLUMN     "order" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "_IndexItem_index" ADD FOREIGN KEY ("A") REFERENCES "IndexItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_IndexItem_index" ADD FOREIGN KEY ("B") REFERENCES "InlineIndex"("id") ON DELETE CASCADE ON UPDATE CASCADE;
