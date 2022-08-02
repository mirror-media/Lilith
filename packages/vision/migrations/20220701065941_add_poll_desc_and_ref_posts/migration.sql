-- AlterTable
ALTER TABLE "Poll" ADD COLUMN     "description" TEXT NOT NULL DEFAULT E'';

-- CreateTable
CREATE TABLE "_Poll_ref_posts" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_Poll_ref_posts_AB_unique" ON "_Poll_ref_posts"("A", "B");

-- CreateIndex
CREATE INDEX "_Poll_ref_posts_B_index" ON "_Poll_ref_posts"("B");

-- AddForeignKey
ALTER TABLE "_Poll_ref_posts" ADD FOREIGN KEY ("A") REFERENCES "Poll"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Poll_ref_posts" ADD FOREIGN KEY ("B") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
