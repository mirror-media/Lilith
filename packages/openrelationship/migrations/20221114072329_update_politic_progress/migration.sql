/*
  Warnings:

  - You are about to drop the `PoliticProgress` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_Politic_progress` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[organization]` on the table `PersonElection` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "PoliticProgress" DROP CONSTRAINT "PoliticProgress_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "PoliticProgress" DROP CONSTRAINT "PoliticProgress_politic_fkey";

-- DropForeignKey
ALTER TABLE "PoliticProgress" DROP CONSTRAINT "PoliticProgress_updatedBy_fkey";

-- DropForeignKey
ALTER TABLE "_Politic_progress" DROP CONSTRAINT "_Politic_progress_A_fkey";

-- DropForeignKey
ALTER TABLE "_Politic_progress" DROP CONSTRAINT "_Politic_progress_B_fkey";

-- AlterTable
ALTER TABLE "PersonElection" ADD COLUMN     "organization" INTEGER;

-- AlterTable
ALTER TABLE "Politic" ADD COLUMN     "current_progress" TEXT DEFAULT E'active';

-- DropTable
DROP TABLE "PoliticProgress";

-- DropTable
DROP TABLE "_Politic_progress";

-- CreateIndex
CREATE UNIQUE INDEX "PersonElection_organization_key" ON "PersonElection"("organization");

-- AddForeignKey
ALTER TABLE "PersonElection" ADD CONSTRAINT "PersonElection_organization_fkey" FOREIGN KEY ("organization") REFERENCES "PersonOrganization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
