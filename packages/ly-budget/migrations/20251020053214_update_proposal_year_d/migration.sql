/*
  Warnings:

  - Added the required column `year` to the `Proposal` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Proposal" ADD COLUMN     "year" INTEGER NOT NULL,
ALTER COLUMN "reductionAmount" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "freezeAmount" SET DATA TYPE DOUBLE PRECISION;
