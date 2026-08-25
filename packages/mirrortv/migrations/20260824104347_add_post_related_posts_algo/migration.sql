-- CreateTable
CREATE TABLE "_Post_relatedPosts_algo" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_Post_relatedPosts_algo_AB_unique" ON "_Post_relatedPosts_algo"("A", "B");

-- CreateIndex
CREATE INDEX "_Post_relatedPosts_algo_B_index" ON "_Post_relatedPosts_algo"("B");

-- AddForeignKey
ALTER TABLE "_Post_relatedPosts_algo" ADD CONSTRAINT "_Post_relatedPosts_algo_A_fkey" FOREIGN KEY ("A") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_relatedPosts_algo" ADD CONSTRAINT "_Post_relatedPosts_algo_B_fkey" FOREIGN KEY ("B") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

