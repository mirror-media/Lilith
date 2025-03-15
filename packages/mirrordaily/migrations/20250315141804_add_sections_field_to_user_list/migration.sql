-- CreateTable
CREATE TABLE "_User_sections" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_User_sections_AB_unique" ON "_User_sections"("A", "B");

-- CreateIndex
CREATE INDEX "_User_sections_B_index" ON "_User_sections"("B");

-- AddForeignKey
ALTER TABLE "_User_sections" ADD CONSTRAINT "_User_sections_A_fkey" FOREIGN KEY ("A") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_User_sections" ADD CONSTRAINT "_User_sections_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
