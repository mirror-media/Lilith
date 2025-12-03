/*
  Warnings:

  - Made the column `email` on table `Member` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Member" ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "email" SET DEFAULT '';
