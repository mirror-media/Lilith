-- CreateTable
CREATE TABLE "_External_relatedPosts" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_External_relatedExternals" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_External_relatedPosts_AB_unique" ON "_External_relatedPosts"("A", "B");

-- CreateIndex
CREATE INDEX "_External_relatedPosts_B_index" ON "_External_relatedPosts"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_External_relatedExternals_AB_unique" ON "_External_relatedExternals"("A", "B");

-- CreateIndex
CREATE INDEX "_External_relatedExternals_B_index" ON "_External_relatedExternals"("B");

-- AddForeignKey
ALTER TABLE "_External_relatedPosts" ADD CONSTRAINT "_External_relatedPosts_A_fkey" FOREIGN KEY ("A") REFERENCES "External"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_External_relatedPosts" ADD CONSTRAINT "_External_relatedPosts_B_fkey" FOREIGN KEY ("B") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_External_relatedExternals" ADD CONSTRAINT "_External_relatedExternals_A_fkey" FOREIGN KEY ("A") REFERENCES "External"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_External_relatedExternals" ADD CONSTRAINT "_External_relatedExternals_B_fkey" FOREIGN KEY ("B") REFERENCES "External"("id") ON DELETE CASCADE ON UPDATE CASCADE;
