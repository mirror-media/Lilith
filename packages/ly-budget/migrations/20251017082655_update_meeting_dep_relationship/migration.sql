/*
  Warnings:

  - You are about to drop the column `government` on the `Meeting` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Meeting" DROP CONSTRAINT "Meeting_government_fkey";

-- DropIndex
DROP INDEX "Meeting_government_idx";

-- AlterTable
ALTER TABLE "Meeting" DROP COLUMN "government";

-- CreateTable
CREATE TABLE "_Meeting_government" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_Meeting_government_AB_unique" ON "_Meeting_government"("A", "B");

-- CreateIndex
CREATE INDEX "_Meeting_government_B_index" ON "_Meeting_government"("B");

-- AddForeignKey
ALTER TABLE "_Meeting_government" ADD CONSTRAINT "_Meeting_government_A_fkey" FOREIGN KEY ("A") REFERENCES "Government"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Meeting_government" ADD CONSTRAINT "_Meeting_government_B_fkey" FOREIGN KEY ("B") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;
