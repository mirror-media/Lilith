/*
  Warnings:

  - You are about to drop the `_Member_sections` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_Member_sections" DROP CONSTRAINT "_Member_sections_A_fkey";

-- DropForeignKey
ALTER TABLE "_Member_sections" DROP CONSTRAINT "_Member_sections_B_fkey";

-- DropTable
DROP TABLE "_Member_sections";

-- CreateTable
CREATE TABLE "_Member_categories" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_Member_categories_AB_unique" ON "_Member_categories"("A", "B");

-- CreateIndex
CREATE INDEX "_Member_categories_B_index" ON "_Member_categories"("B");

-- AddForeignKey
ALTER TABLE "_Member_categories" ADD FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Member_categories" ADD FOREIGN KEY ("B") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
