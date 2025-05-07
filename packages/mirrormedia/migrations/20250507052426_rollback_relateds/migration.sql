/*
  Warnings:

  - You are about to drop the column `related_posts_order` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the `_Post_related_posts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_Post_related_posts" DROP CONSTRAINT "_Post_related_posts_A_fkey";

-- DropForeignKey
ALTER TABLE "_Post_related_posts" DROP CONSTRAINT "_Post_related_posts_B_fkey";

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "related_posts_order";

-- DropTable
DROP TABLE "_Post_related_posts";
