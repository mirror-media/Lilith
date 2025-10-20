/*
  Warnings:

  - You are about to drop the column `term` on the `People` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[color]` on the table `Party` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "People" DROP CONSTRAINT "People_term_fkey";

-- DropIndex
DROP INDEX "People_term_idx";

-- AlterTable
ALTER TABLE "Party" ADD COLUMN     "color" TEXT NOT NULL DEFAULT '000000';

-- AlterTable
ALTER TABLE "People" DROP COLUMN "term";

-- CreateTable
CREATE TABLE "_People_term" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_People_term_AB_unique" ON "_People_term"("A", "B");

-- CreateIndex
CREATE INDEX "_People_term_B_index" ON "_People_term"("B");

-- AddForeignKey
ALTER TABLE "_People_term" ADD CONSTRAINT "_People_term_A_fkey" FOREIGN KEY ("A") REFERENCES "People"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_People_term" ADD CONSTRAINT "_People_term_B_fkey" FOREIGN KEY ("B") REFERENCES "Term"("id") ON DELETE CASCADE ON UPDATE CASCADE;
