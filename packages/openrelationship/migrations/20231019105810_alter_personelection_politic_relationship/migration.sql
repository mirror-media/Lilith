/*
  Warnings:

  - You are about to drop the column `person` on the `Politic` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Politic" DROP CONSTRAINT "Politic_person_fkey";

-- DropIndex
DROP INDEX "Politic_person_idx";

-- AlterTable
ALTER TABLE "Politic" DROP COLUMN "person";

-- CreateTable
CREATE TABLE "_Politic_person" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_Politic_person_AB_unique" ON "_Politic_person"("A", "B");

-- CreateIndex
CREATE INDEX "_Politic_person_B_index" ON "_Politic_person"("B");

-- AddForeignKey
ALTER TABLE "_Politic_person" ADD CONSTRAINT "_Politic_person_A_fkey" FOREIGN KEY ("A") REFERENCES "PersonElection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Politic_person" ADD CONSTRAINT "_Politic_person_B_fkey" FOREIGN KEY ("B") REFERENCES "Politic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
