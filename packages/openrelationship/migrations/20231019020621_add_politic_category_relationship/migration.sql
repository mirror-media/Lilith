-- CreateTable
CREATE TABLE "_PoliticCategory_politics" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_PoliticCategory_politics_AB_unique" ON "_PoliticCategory_politics"("A", "B");

-- CreateIndex
CREATE INDEX "_PoliticCategory_politics_B_index" ON "_PoliticCategory_politics"("B");

-- AddForeignKey
ALTER TABLE "_PoliticCategory_politics" ADD CONSTRAINT "_PoliticCategory_politics_A_fkey" FOREIGN KEY ("A") REFERENCES "Politic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PoliticCategory_politics" ADD CONSTRAINT "_PoliticCategory_politics_B_fkey" FOREIGN KEY ("B") REFERENCES "PoliticCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
