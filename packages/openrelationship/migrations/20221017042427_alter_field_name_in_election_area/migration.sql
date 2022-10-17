/*
  Warnings:

  - You are about to drop the column `aboriginal` on the `ElectionArea` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ElectionArea" DROP COLUMN "aboriginal",
ADD COLUMN     "indigenous" TEXT;
