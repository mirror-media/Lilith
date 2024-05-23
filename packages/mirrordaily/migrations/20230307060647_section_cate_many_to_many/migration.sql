/*
  Warnings:

  - You are about to drop the column `sections` on the `Category` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_sections_fkey";

-- DropIndex
DROP INDEX "Category_sections_idx";

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "sections";

-- CreateTable
CREATE TABLE "_Category_sections" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_Category_sections_AB_unique" ON "_Category_sections"("A", "B");

-- CreateIndex
CREATE INDEX "_Category_sections_B_index" ON "_Category_sections"("B");

-- AddForeignKey
ALTER TABLE "_Category_sections" ADD FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Category_sections" ADD FOREIGN KEY ("B") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;
