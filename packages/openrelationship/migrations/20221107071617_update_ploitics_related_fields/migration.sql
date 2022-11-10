/*
  Warnings:

  - You are about to drop the column `content` on the `PoliticProgress` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Politic" ADD COLUMN     "dispute" TEXT NOT NULL DEFAULT E'';

-- AlterTable
ALTER TABLE "PoliticProgress" DROP COLUMN "content";
