/*
  Warnings:

  - You are about to drop the `_EditorChoice_choices` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `NoteCategory` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "_EditorChoice_choices" DROP CONSTRAINT "_EditorChoice_choices_A_fkey";

-- DropForeignKey
ALTER TABLE "_EditorChoice_choices" DROP CONSTRAINT "_EditorChoice_choices_B_fkey";

-- AlterTable
ALTER TABLE "EditorChoice" ADD COLUMN     "choices" INTEGER;

-- DropTable
DROP TABLE "_EditorChoice_choices";

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "EditorChoice_choices_idx" ON "EditorChoice"("choices");

-- CreateIndex
CREATE UNIQUE INDEX "NoteCategory_slug_key" ON "NoteCategory"("slug");

-- AddForeignKey
ALTER TABLE "EditorChoice" ADD CONSTRAINT "EditorChoice_choices_fkey" FOREIGN KEY ("choices") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;
