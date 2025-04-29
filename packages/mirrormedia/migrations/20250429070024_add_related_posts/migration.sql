-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "related_posts_order" JSONB;

-- CreateTable
CREATE TABLE "_Post_related_posts" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_Post_related_posts_AB_unique" ON "_Post_related_posts"("A", "B");

-- CreateIndex
CREATE INDEX "_Post_related_posts_B_index" ON "_Post_related_posts"("B");

-- AddForeignKey
ALTER TABLE "_Post_related_posts" ADD CONSTRAINT "_Post_related_posts_A_fkey" FOREIGN KEY ("A") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_related_posts" ADD CONSTRAINT "_Post_related_posts_B_fkey" FOREIGN KEY ("B") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
