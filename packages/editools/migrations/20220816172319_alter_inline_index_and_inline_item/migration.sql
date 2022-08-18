/*
  Warnings:

  - You are about to drop the column `color` on the `IndexItem` table. All the data in the column will be lost.
  - You are about to drop the column `style` on the `InlineIndex` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "IndexItem" DROP COLUMN "color",
ADD COLUMN     "borderColor" TEXT NOT NULL DEFAULT E'#000';

-- AlterTable
ALTER TABLE "InlineIndex" DROP COLUMN "style";
