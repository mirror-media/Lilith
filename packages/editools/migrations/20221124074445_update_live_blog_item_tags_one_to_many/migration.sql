/*
  Warnings:

  - You are about to drop the column `tags` on the `LiveblogItem` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "LiveblogItem" DROP CONSTRAINT "LiveblogItem_tags_fkey";

-- DropIndex
DROP INDEX "LiveblogItem_tags_idx";

-- AlterTable
ALTER TABLE "LiveblogItem" DROP COLUMN "tags";

-- CreateTable
CREATE TABLE "_LiveblogItem_tags" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_LiveblogItem_tags_AB_unique" ON "_LiveblogItem_tags"("A", "B");

-- CreateIndex
CREATE INDEX "_LiveblogItem_tags_B_index" ON "_LiveblogItem_tags"("B");

-- AddForeignKey
ALTER TABLE "_LiveblogItem_tags" ADD FOREIGN KEY ("A") REFERENCES "LiveblogItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LiveblogItem_tags" ADD FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
