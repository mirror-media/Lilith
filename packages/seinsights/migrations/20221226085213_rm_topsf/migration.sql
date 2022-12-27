/*
  Warnings:

  - You are about to drop the column `topSpecialfeature` on the `SpecialfeatureList` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "SpecialfeatureList" DROP CONSTRAINT "SpecialfeatureList_topSpecialfeature_fkey";

-- DropIndex
DROP INDEX "SpecialfeatureList_topSpecialfeature_idx";

-- AlterTable
ALTER TABLE "SpecialfeatureList" DROP COLUMN "topSpecialfeature";
