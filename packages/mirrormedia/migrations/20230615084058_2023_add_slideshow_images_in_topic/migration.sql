-- CreateTable
CREATE TABLE "_Topic_slideshow_images" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_Topic_slideshow_images_AB_unique" ON "_Topic_slideshow_images"("A", "B");

-- CreateIndex
CREATE INDEX "_Topic_slideshow_images_B_index" ON "_Topic_slideshow_images"("B");

-- AddForeignKey
ALTER TABLE "_Topic_slideshow_images" ADD CONSTRAINT "_Topic_slideshow_images_A_fkey" FOREIGN KEY ("A") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Topic_slideshow_images" ADD CONSTRAINT "_Topic_slideshow_images_B_fkey" FOREIGN KEY ("B") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
