-- CreateTable
CREATE TABLE "_Category_externals" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_External_sections" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_Category_externals_AB_unique" ON "_Category_externals"("A", "B");

-- CreateIndex
CREATE INDEX "_Category_externals_B_index" ON "_Category_externals"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_External_sections_AB_unique" ON "_External_sections"("A", "B");

-- CreateIndex
CREATE INDEX "_External_sections_B_index" ON "_External_sections"("B");

-- AddForeignKey
ALTER TABLE "_Category_externals" ADD CONSTRAINT "_Category_externals_A_fkey" FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Category_externals" ADD CONSTRAINT "_Category_externals_B_fkey" FOREIGN KEY ("B") REFERENCES "External"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_External_sections" ADD CONSTRAINT "_External_sections_A_fkey" FOREIGN KEY ("A") REFERENCES "External"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_External_sections" ADD CONSTRAINT "_External_sections_B_fkey" FOREIGN KEY ("B") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;
