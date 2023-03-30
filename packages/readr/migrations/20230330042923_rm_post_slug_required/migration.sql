/*
  Warnings:

  - Made the column `slug` on table `Post` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Post_slug_key";

-- AlterTable
ALTER TABLE "Post" ALTER COLUMN "slug" SET NOT NULL,
ALTER COLUMN "slug" SET DEFAULT E'';
