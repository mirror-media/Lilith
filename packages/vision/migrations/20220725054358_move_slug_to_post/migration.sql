/*
  Warnings:

  - You are about to drop the column `slug` on the `Longform` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Post` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Longform_slug_key";

-- AlterTable
ALTER TABLE "Longform" DROP COLUMN "slug";

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "slug" TEXT NOT NULL DEFAULT E'';
