/*
  Warnings:

  - You are about to drop the column `name` on the `Condition` table. All the data in the column will be lost.
  - You are about to drop the column `option` on the `Condition` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Condition" DROP CONSTRAINT "Condition_option_fkey";

-- DropIndex
DROP INDEX "Condition_option_idx";

-- AlterTable
ALTER TABLE "Condition" DROP COLUMN "name",
DROP COLUMN "option",
ADD COLUMN     "title" TEXT NOT NULL DEFAULT E'';

-- CreateTable
CREATE TABLE "_Condition_option" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_Condition_option_AB_unique" ON "_Condition_option"("A", "B");

-- CreateIndex
CREATE INDEX "_Condition_option_B_index" ON "_Condition_option"("B");

-- AddForeignKey
ALTER TABLE "_Condition_option" ADD FOREIGN KEY ("A") REFERENCES "Condition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Condition_option" ADD FOREIGN KEY ("B") REFERENCES "FieldOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;
