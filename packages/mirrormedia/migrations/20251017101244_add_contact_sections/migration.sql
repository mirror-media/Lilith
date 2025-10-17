-- CreateTable
CREATE TABLE "_Contact_sections" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_Contact_sections_AB_unique" ON "_Contact_sections"("A", "B");

-- CreateIndex
CREATE INDEX "_Contact_sections_B_index" ON "_Contact_sections"("B");

-- AddForeignKey
ALTER TABLE "_Contact_sections" ADD CONSTRAINT "_Contact_sections_A_fkey" FOREIGN KEY ("A") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Contact_sections" ADD CONSTRAINT "_Contact_sections_B_fkey" FOREIGN KEY ("B") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;
