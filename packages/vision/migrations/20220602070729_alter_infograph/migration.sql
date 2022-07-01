-- CreateTable
CREATE TABLE "_InfoGraph_relatedPosts" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_InfoGraph_relatedPosts_AB_unique" ON "_InfoGraph_relatedPosts"("A", "B");

-- CreateIndex
CREATE INDEX "_InfoGraph_relatedPosts_B_index" ON "_InfoGraph_relatedPosts"("B");

-- AddForeignKey
ALTER TABLE "_InfoGraph_relatedPosts" ADD FOREIGN KEY ("A") REFERENCES "InfoGraph"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InfoGraph_relatedPosts" ADD FOREIGN KEY ("B") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
