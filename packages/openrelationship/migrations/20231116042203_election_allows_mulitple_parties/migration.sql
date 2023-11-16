/*
  Warnings:

  - You are about to drop the column `organizationsElection` on the `Election` table. All the data in the column will be lost.
  - You are about to drop the `_OrganizationsElection_politics` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `expert` on table `PoliticExpert` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Election" DROP CONSTRAINT "Election_organizationsElection_fkey";

-- DropForeignKey
ALTER TABLE "_OrganizationsElection_politics" DROP CONSTRAINT "_OrganizationsElection_politics_A_fkey";

-- DropForeignKey
ALTER TABLE "_OrganizationsElection_politics" DROP CONSTRAINT "_OrganizationsElection_politics_B_fkey";

-- DropIndex
DROP INDEX "Election_organizationsElection_idx";

-- AlterTable
ALTER TABLE "Election" DROP COLUMN "organizationsElection";

-- AlterTable
ALTER TABLE "PoliticExpert" ALTER COLUMN "expert" SET NOT NULL,
ALTER COLUMN "expert" SET DEFAULT '';

-- DropTable
DROP TABLE "_OrganizationsElection_politics";

-- CreateTable
CREATE TABLE "_Election_organizationsElection" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_Election_organizationsElection_AB_unique" ON "_Election_organizationsElection"("A", "B");

-- CreateIndex
CREATE INDEX "_Election_organizationsElection_B_index" ON "_Election_organizationsElection"("B");

-- AddForeignKey
ALTER TABLE "_Election_organizationsElection" ADD CONSTRAINT "_Election_organizationsElection_A_fkey" FOREIGN KEY ("A") REFERENCES "Election"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Election_organizationsElection" ADD CONSTRAINT "_Election_organizationsElection_B_fkey" FOREIGN KEY ("B") REFERENCES "OrganizationsElection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
