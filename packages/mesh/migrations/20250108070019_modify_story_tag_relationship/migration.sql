/*
  Warnings:

  - You are about to drop the `_Tag_story` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_Tag_story" DROP CONSTRAINT "_Tag_story_A_fkey";

-- DropForeignKey
ALTER TABLE "_Tag_story" DROP CONSTRAINT "_Tag_story_B_fkey";

-- DropTable
DROP TABLE "_Tag_story";
