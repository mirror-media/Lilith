-- CreateTable
CREATE TABLE "_PersonElection_politics" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_PersonElection_politics_AB_unique" ON "_PersonElection_politics"("A", "B");

-- CreateIndex
CREATE INDEX "_PersonElection_politics_B_index" ON "_PersonElection_politics"("B");

-- AddForeignKey
ALTER TABLE "_PersonElection_politics" ADD FOREIGN KEY ("A") REFERENCES "PersonElection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PersonElection_politics" ADD FOREIGN KEY ("B") REFERENCES "Politic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
