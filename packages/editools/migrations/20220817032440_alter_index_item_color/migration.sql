/*
  Warnings:

  - You are about to drop the column `borderColor` on the `IndexItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "IndexItem" DROP COLUMN "borderColor",
ADD COLUMN     "color" TEXT NOT NULL DEFAULT E'#fff';
