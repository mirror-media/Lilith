/*
  Warnings:

  - You are about to drop the column `url` on the `IndexItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "IndexItem" DROP COLUMN "url",
ADD COLUMN     "originCode" TEXT NOT NULL DEFAULT E'',
ADD COLUMN     "slug" TEXT NOT NULL DEFAULT E'',
ALTER COLUMN "color" SET DEFAULT E'#fff';
