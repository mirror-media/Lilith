-- CreateTable
CREATE TABLE "_External_tags" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_External_relateds" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_External_tags_AB_unique" ON "_External_tags"("A", "B");

-- CreateIndex
CREATE INDEX "_External_tags_B_index" ON "_External_tags"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_External_relateds_AB_unique" ON "_External_relateds"("A", "B");

-- CreateIndex
CREATE INDEX "_External_relateds_B_index" ON "_External_relateds"("B");

-- AddForeignKey
ALTER TABLE "_External_tags" ADD CONSTRAINT "_External_tags_A_fkey" FOREIGN KEY ("A") REFERENCES "External"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_External_tags" ADD CONSTRAINT "_External_tags_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_External_relateds" ADD CONSTRAINT "_External_relateds_A_fkey" FOREIGN KEY ("A") REFERENCES "External"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_External_relateds" ADD CONSTRAINT "_External_relateds_B_fkey" FOREIGN KEY ("B") REFERENCES "External"("id") ON DELETE CASCADE ON UPDATE CASCADE;
