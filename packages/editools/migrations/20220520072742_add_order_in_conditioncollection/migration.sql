/*
  Warnings:

  - Added the required column `order` to the `ConditionCollection` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ConditionCollection" ADD COLUMN     "order" TEXT NOT NULL;
