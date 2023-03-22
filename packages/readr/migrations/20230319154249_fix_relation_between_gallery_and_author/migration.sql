/*
  Warnings:

  - You are about to drop the column `writer` on the `Gallery` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Gallery" DROP CONSTRAINT "Gallery_writer_fkey";

-- CreateTable
CREATE TABLE "_Author_gallery" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_Author_gallery_AB_unique" ON "_Author_gallery"("A", "B");

-- CreateIndex
CREATE INDEX "_Author_gallery_B_index" ON "_Author_gallery"("B");

-- Move existed records
INSERT INTO "_Author_gallery" ("A", "B") SELECT "writer", "id" FROM "Gallery" WHERE "writer" IS NOT NULL;

-- DropIndex
DROP INDEX "Gallery_writer_idx";

-- AlterTable
ALTER TABLE "Gallery" DROP COLUMN "writer";

-- AddForeignKey
ALTER TABLE "_Author_gallery" ADD FOREIGN KEY ("A") REFERENCES "Author"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Author_gallery" ADD FOREIGN KEY ("B") REFERENCES "Gallery"("id") ON DELETE CASCADE ON UPDATE CASCADE;
