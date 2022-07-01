/*
  Warnings:

  - You are about to drop the `_Collection_comment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_Collection_comment" DROP CONSTRAINT "_Collection_comment_A_fkey";

-- DropForeignKey
ALTER TABLE "_Collection_comment" DROP CONSTRAINT "_Collection_comment_B_fkey";

-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "collection" INTEGER;

-- DropTable
DROP TABLE "_Collection_comment";

-- CreateIndex
CREATE INDEX "Comment_collection_idx" ON "Comment"("collection");

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_collection_fkey" FOREIGN KEY ("collection") REFERENCES "Collection"("id") ON DELETE SET NULL ON UPDATE CASCADE;
