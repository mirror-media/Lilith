/*
  Warnings:

  - You are about to drop the column `posts` on the `Event` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_posts_fkey";

-- DropIndex
DROP INDEX "Event_posts_key";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "posts",
ADD COLUMN     "map_embed" TEXT NOT NULL DEFAULT E'';

-- CreateTable
CREATE TABLE "_Event_ref_posts" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_Event_ref_posts_AB_unique" ON "_Event_ref_posts"("A", "B");

-- CreateIndex
CREATE INDEX "_Event_ref_posts_B_index" ON "_Event_ref_posts"("B");

-- AddForeignKey
ALTER TABLE "_Event_ref_posts" ADD FOREIGN KEY ("A") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Event_ref_posts" ADD FOREIGN KEY ("B") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
