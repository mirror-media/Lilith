/*
  Warnings:

  - You are about to drop the `_Member_comment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_Member_comment" DROP CONSTRAINT "_Member_comment_A_fkey";

-- DropForeignKey
ALTER TABLE "_Member_comment" DROP CONSTRAINT "_Member_comment_B_fkey";

-- DropTable
DROP TABLE "_Member_comment";
