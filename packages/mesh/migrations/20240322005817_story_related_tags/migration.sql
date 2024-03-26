-- CreateTable
CREATE TABLE "_Story_tag" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Tag_story" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_Story_tag_AB_unique" ON "_Story_tag"("A", "B");

-- CreateIndex
CREATE INDEX "_Story_tag_B_index" ON "_Story_tag"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Tag_story_AB_unique" ON "_Tag_story"("A", "B");

-- CreateIndex
CREATE INDEX "_Tag_story_B_index" ON "_Tag_story"("B");

-- AddForeignKey
ALTER TABLE "_Story_tag" ADD FOREIGN KEY ("A") REFERENCES "Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Story_tag" ADD FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Tag_story" ADD FOREIGN KEY ("A") REFERENCES "Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Tag_story" ADD FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
