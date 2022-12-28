-- CreateTable
CREATE TABLE "_Resource_tags" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_Resource_tags_AB_unique" ON "_Resource_tags"("A", "B");

-- CreateIndex
CREATE INDEX "_Resource_tags_B_index" ON "_Resource_tags"("B");

-- AddForeignKey
ALTER TABLE "_Resource_tags" ADD FOREIGN KEY ("A") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Resource_tags" ADD FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
