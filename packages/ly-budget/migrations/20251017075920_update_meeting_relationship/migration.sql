/*
  Warnings:

  - You are about to drop the column `committee` on the `Meeting` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Meeting" DROP CONSTRAINT "Meeting_committee_fkey";

-- DropIndex
DROP INDEX "Meeting_committee_idx";

-- AlterTable
ALTER TABLE "Meeting" DROP COLUMN "committee";

-- CreateTable
CREATE TABLE "_Meeting_committee" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_Meeting_committee_AB_unique" ON "_Meeting_committee"("A", "B");

-- CreateIndex
CREATE INDEX "_Meeting_committee_B_index" ON "_Meeting_committee"("B");

-- AddForeignKey
ALTER TABLE "_Meeting_committee" ADD CONSTRAINT "_Meeting_committee_A_fkey" FOREIGN KEY ("A") REFERENCES "Committee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Meeting_committee" ADD CONSTRAINT "_Meeting_committee_B_fkey" FOREIGN KEY ("B") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;
