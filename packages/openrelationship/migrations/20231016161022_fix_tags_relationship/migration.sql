/*
  Warnings:

  - You are about to drop the column `tags` on the `Election` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `Person` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Election" DROP CONSTRAINT "Election_tags_fkey";

-- DropForeignKey
ALTER TABLE "Organization" DROP CONSTRAINT "Organization_tags_fkey";

-- DropForeignKey
ALTER TABLE "Person" DROP CONSTRAINT "Person_tags_fkey";

-- DropIndex
DROP INDEX "Election_tags_idx";

-- DropIndex
DROP INDEX "Organization_tags_idx";

-- DropIndex
DROP INDEX "Person_tags_idx";

-- AlterTable
ALTER TABLE "Election" DROP COLUMN "tags";

-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "tags";

-- AlterTable
ALTER TABLE "Person" DROP COLUMN "tags";

-- CreateTable
CREATE TABLE "_Election_tags" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Person_tags" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Organization_tags" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_Election_tags_AB_unique" ON "_Election_tags"("A", "B");

-- CreateIndex
CREATE INDEX "_Election_tags_B_index" ON "_Election_tags"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Person_tags_AB_unique" ON "_Person_tags"("A", "B");

-- CreateIndex
CREATE INDEX "_Person_tags_B_index" ON "_Person_tags"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Organization_tags_AB_unique" ON "_Organization_tags"("A", "B");

-- CreateIndex
CREATE INDEX "_Organization_tags_B_index" ON "_Organization_tags"("B");

-- AddForeignKey
ALTER TABLE "_Election_tags" ADD CONSTRAINT "_Election_tags_A_fkey" FOREIGN KEY ("A") REFERENCES "Election"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Election_tags" ADD CONSTRAINT "_Election_tags_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Person_tags" ADD CONSTRAINT "_Person_tags_A_fkey" FOREIGN KEY ("A") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Person_tags" ADD CONSTRAINT "_Person_tags_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Organization_tags" ADD CONSTRAINT "_Organization_tags_A_fkey" FOREIGN KEY ("A") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Organization_tags" ADD CONSTRAINT "_Organization_tags_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
