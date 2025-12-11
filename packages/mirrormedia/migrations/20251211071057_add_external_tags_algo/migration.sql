-- CreateTable
CREATE TABLE "_External_tags_algo" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_External_tags_algo_AB_unique" ON "_External_tags_algo"("A", "B");

-- CreateIndex
CREATE INDEX "_External_tags_algo_B_index" ON "_External_tags_algo"("B");

-- AddForeignKey
ALTER TABLE "_External_tags_algo" ADD CONSTRAINT "_External_tags_algo_A_fkey" FOREIGN KEY ("A") REFERENCES "External"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_External_tags_algo" ADD CONSTRAINT "_External_tags_algo_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
