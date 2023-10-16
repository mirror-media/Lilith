/*
  Warnings:

  - You are about to drop the column `politic` on the `PoliticControversie` table. All the data in the column will be lost.
  - You are about to drop the column `politic` on the `PoliticExpert` table. All the data in the column will be lost.
  - You are about to drop the column `politic` on the `PoliticFactCheck` table. All the data in the column will be lost.
  - You are about to drop the column `politic` on the `PoliticPositionChange` table. All the data in the column will be lost.
  - You are about to drop the column `politic` on the `PoliticRepeat` table. All the data in the column will be lost.
  - You are about to drop the column `politic` on the `PoliticResponse` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "PoliticControversie" DROP CONSTRAINT "PoliticControversie_politic_fkey";

-- DropForeignKey
ALTER TABLE "PoliticExpert" DROP CONSTRAINT "PoliticExpert_politic_fkey";

-- DropForeignKey
ALTER TABLE "PoliticFactCheck" DROP CONSTRAINT "PoliticFactCheck_politic_fkey";

-- DropForeignKey
ALTER TABLE "PoliticPositionChange" DROP CONSTRAINT "PoliticPositionChange_politic_fkey";

-- DropForeignKey
ALTER TABLE "PoliticRepeat" DROP CONSTRAINT "PoliticRepeat_politic_fkey";

-- DropForeignKey
ALTER TABLE "PoliticResponse" DROP CONSTRAINT "PoliticResponse_politic_fkey";

-- DropIndex
DROP INDEX "PoliticControversie_politic_idx";

-- DropIndex
DROP INDEX "PoliticExpert_politic_idx";

-- DropIndex
DROP INDEX "PoliticFactCheck_politic_idx";

-- DropIndex
DROP INDEX "PoliticPositionChange_politic_idx";

-- DropIndex
DROP INDEX "PoliticRepeat_politic_idx";

-- DropIndex
DROP INDEX "PoliticResponse_politic_idx";

-- AlterTable
ALTER TABLE "PoliticControversie" DROP COLUMN "politic";

-- AlterTable
ALTER TABLE "PoliticExpert" DROP COLUMN "politic";

-- AlterTable
ALTER TABLE "PoliticFactCheck" DROP COLUMN "politic";

-- AlterTable
ALTER TABLE "PoliticPositionChange" DROP COLUMN "politic";

-- AlterTable
ALTER TABLE "PoliticRepeat" DROP COLUMN "politic";

-- AlterTable
ALTER TABLE "PoliticResponse" DROP COLUMN "politic";

-- CreateTable
CREATE TABLE "_Politic_positionChange" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Politic_factCheck" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Politic_expertPoint" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Politic_repeat" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Politic_controversies" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Politic_response" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_Politic_positionChange_AB_unique" ON "_Politic_positionChange"("A", "B");

-- CreateIndex
CREATE INDEX "_Politic_positionChange_B_index" ON "_Politic_positionChange"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Politic_factCheck_AB_unique" ON "_Politic_factCheck"("A", "B");

-- CreateIndex
CREATE INDEX "_Politic_factCheck_B_index" ON "_Politic_factCheck"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Politic_expertPoint_AB_unique" ON "_Politic_expertPoint"("A", "B");

-- CreateIndex
CREATE INDEX "_Politic_expertPoint_B_index" ON "_Politic_expertPoint"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Politic_repeat_AB_unique" ON "_Politic_repeat"("A", "B");

-- CreateIndex
CREATE INDEX "_Politic_repeat_B_index" ON "_Politic_repeat"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Politic_controversies_AB_unique" ON "_Politic_controversies"("A", "B");

-- CreateIndex
CREATE INDEX "_Politic_controversies_B_index" ON "_Politic_controversies"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Politic_response_AB_unique" ON "_Politic_response"("A", "B");

-- CreateIndex
CREATE INDEX "_Politic_response_B_index" ON "_Politic_response"("B");

-- AddForeignKey
ALTER TABLE "_Politic_positionChange" ADD CONSTRAINT "_Politic_positionChange_A_fkey" FOREIGN KEY ("A") REFERENCES "Politic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Politic_positionChange" ADD CONSTRAINT "_Politic_positionChange_B_fkey" FOREIGN KEY ("B") REFERENCES "PoliticPositionChange"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Politic_factCheck" ADD CONSTRAINT "_Politic_factCheck_A_fkey" FOREIGN KEY ("A") REFERENCES "Politic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Politic_factCheck" ADD CONSTRAINT "_Politic_factCheck_B_fkey" FOREIGN KEY ("B") REFERENCES "PoliticFactCheck"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Politic_expertPoint" ADD CONSTRAINT "_Politic_expertPoint_A_fkey" FOREIGN KEY ("A") REFERENCES "Politic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Politic_expertPoint" ADD CONSTRAINT "_Politic_expertPoint_B_fkey" FOREIGN KEY ("B") REFERENCES "PoliticExpert"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Politic_repeat" ADD CONSTRAINT "_Politic_repeat_A_fkey" FOREIGN KEY ("A") REFERENCES "Politic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Politic_repeat" ADD CONSTRAINT "_Politic_repeat_B_fkey" FOREIGN KEY ("B") REFERENCES "PoliticRepeat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Politic_controversies" ADD CONSTRAINT "_Politic_controversies_A_fkey" FOREIGN KEY ("A") REFERENCES "Politic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Politic_controversies" ADD CONSTRAINT "_Politic_controversies_B_fkey" FOREIGN KEY ("B") REFERENCES "PoliticControversie"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Politic_response" ADD CONSTRAINT "_Politic_response_A_fkey" FOREIGN KEY ("A") REFERENCES "Politic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Politic_response" ADD CONSTRAINT "_Politic_response_B_fkey" FOREIGN KEY ("B") REFERENCES "PoliticResponse"("id") ON DELETE CASCADE ON UPDATE CASCADE;
