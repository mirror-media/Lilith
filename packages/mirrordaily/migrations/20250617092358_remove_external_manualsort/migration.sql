/*
  Warnings:

  - You are about to drop the column `manualOrderOfCategories` on the `External` table. All the data in the column will be lost.
  - You are about to drop the column `manualOrderOfSections` on the `External` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "External" DROP COLUMN "manualOrderOfCategories",
DROP COLUMN "manualOrderOfSections";
