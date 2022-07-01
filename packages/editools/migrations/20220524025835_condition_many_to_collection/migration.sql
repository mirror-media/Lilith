/*
  Warnings:

  - You are about to drop the column `conditionCollection` on the `Condition` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Condition" DROP CONSTRAINT "Condition_conditionCollection_fkey";

-- DropIndex
DROP INDEX "Condition_conditionCollection_idx";

-- AlterTable
ALTER TABLE "Condition" DROP COLUMN "conditionCollection";

-- CreateTable
CREATE TABLE "_Condition_conditionCollection" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_Condition_conditionCollection_AB_unique" ON "_Condition_conditionCollection"("A", "B");

-- CreateIndex
CREATE INDEX "_Condition_conditionCollection_B_index" ON "_Condition_conditionCollection"("B");

-- AddForeignKey
ALTER TABLE "_Condition_conditionCollection" ADD FOREIGN KEY ("A") REFERENCES "Condition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Condition_conditionCollection" ADD FOREIGN KEY ("B") REFERENCES "ConditionCollection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
