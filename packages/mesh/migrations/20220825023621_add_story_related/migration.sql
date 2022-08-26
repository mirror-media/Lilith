-- CreateTable
CREATE TABLE "_Story_related" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_Story_related_AB_unique" ON "_Story_related"("A", "B");

-- CreateIndex
CREATE INDEX "_Story_related_B_index" ON "_Story_related"("B");

-- AddForeignKey
ALTER TABLE "_Story_related" ADD FOREIGN KEY ("A") REFERENCES "Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Story_related" ADD FOREIGN KEY ("B") REFERENCES "Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;
