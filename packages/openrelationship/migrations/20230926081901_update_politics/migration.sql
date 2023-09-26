/*
  Warnings:

  - You are about to drop the column `factCheckSummary` on the `Politic` table. All the data in the column will be lost.
  - You are about to drop the column `positionChangeSummary` on the `Politic` table. All the data in the column will be lost.
  - You are about to drop the column `repeatSummary` on the `Politic` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Politic" DROP COLUMN "factCheckSummary",
DROP COLUMN "positionChangeSummary",
DROP COLUMN "repeatSummary",
ADD COLUMN     "checked" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "PoliticFactCheck" ADD COLUMN     "factCheckSummary" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "PoliticPositionChange" ADD COLUMN     "positionChangeSummary" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "PoliticRepeat" ADD COLUMN     "repeatSummary" TEXT NOT NULL DEFAULT '';
