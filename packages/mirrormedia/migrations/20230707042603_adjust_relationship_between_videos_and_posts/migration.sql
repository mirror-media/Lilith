/*
  Warnings:

  - You are about to drop the `_Video_related_posts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_Video_related_posts" DROP CONSTRAINT "_Video_related_posts_A_fkey";

-- DropForeignKey
ALTER TABLE "_Video_related_posts" DROP CONSTRAINT "_Video_related_posts_B_fkey";

-- DropTable
DROP TABLE "_Video_related_posts";
