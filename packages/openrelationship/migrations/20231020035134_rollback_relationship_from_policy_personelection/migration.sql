/*
  Warnings:

  - You are about to drop the `_PersonElection_politics` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_PersonElection_politics" DROP CONSTRAINT "_PersonElection_politics_A_fkey";

-- DropForeignKey
ALTER TABLE "_PersonElection_politics" DROP CONSTRAINT "_PersonElection_politics_B_fkey";

-- AlterTable
ALTER TABLE "Politic" ADD COLUMN     "person" INTEGER;

-- DropTable
DROP TABLE "_PersonElection_politics";

-- CreateIndex
CREATE INDEX "Politic_person_idx" ON "Politic"("person");

-- AddForeignKey
ALTER TABLE "Politic" ADD CONSTRAINT "Politic_person_fkey" FOREIGN KEY ("person") REFERENCES "PersonElection"("id") ON DELETE SET NULL ON UPDATE CASCADE;
