/*
  Warnings:

  - You are about to drop the column `checkDate` on the `PoliticControversie` table. All the data in the column will be lost.
  - You are about to drop the column `contributer` on the `PoliticControversie` table. All the data in the column will be lost.
  - You are about to drop the column `controversiesSummary` on the `PoliticControversie` table. All the data in the column will be lost.
  - You are about to drop the column `reviewDate` on the `PoliticExpert` table. All the data in the column will be lost.
  - You are about to drop the column `checkDate` on the `PoliticFactCheck` table. All the data in the column will be lost.
  - You are about to drop the column `checkDate` on the `PoliticRepeat` table. All the data in the column will be lost.
  - You are about to drop the column `checkResultType` on the `PoliticRepeat` table. All the data in the column will be lost.
  - You are about to drop the column `checkDate` on the `PoliticResponse` table. All the data in the column will be lost.
  - You are about to drop the column `contributer` on the `PoliticResponse` table. All the data in the column will be lost.
  - Made the column `checkDate` on table `PoliticPositionChange` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "PoliticControversie" DROP COLUMN "checkDate",
DROP COLUMN "contributer",
DROP COLUMN "controversiesSummary";

-- AlterTable
ALTER TABLE "PoliticExpert" DROP COLUMN "reviewDate";

-- AlterTable
ALTER TABLE "PoliticFactCheck" DROP COLUMN "checkDate";

-- AlterTable
ALTER TABLE "PoliticPositionChange" ALTER COLUMN "checkDate" SET NOT NULL;

-- AlterTable
ALTER TABLE "PoliticRepeat" DROP COLUMN "checkDate",
DROP COLUMN "checkResultType";

-- AlterTable
ALTER TABLE "PoliticResponse" DROP COLUMN "checkDate",
DROP COLUMN "contributer";
