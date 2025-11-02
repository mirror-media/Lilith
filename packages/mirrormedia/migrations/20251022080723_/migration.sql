/*
  Warnings:

  - You are about to drop the column `isMemberOnly` on the `Category` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Category" DROP COLUMN "isMemberOnly";

-- AlterTable
ALTER TABLE "Section" ADD COLUMN     "color" TEXT NOT NULL DEFAULT '#FF5A36';
