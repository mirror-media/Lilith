/*
  Warnings:

  - You are about to drop the column `heroimage` on the `EditorChoice` table. All the data in the column will be lost.
  - You are about to drop the column `descriptions` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `sortorder` on the `Game` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "EditorChoice" DROP COLUMN "heroimage",
ADD COLUMN     "heroImage" INTEGER;

-- AlterTable
ALTER TABLE "Game" DROP COLUMN "descriptions",
DROP COLUMN "sortorder",
ADD COLUMN     "description" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "sortOrder" INTEGER;

-- CreateIndex
CREATE INDEX "EditorChoice_heroImage_idx" ON "EditorChoice"("heroImage");

-- AddForeignKey
ALTER TABLE "EditorChoice" ADD CONSTRAINT "EditorChoice_heroImage_fkey" FOREIGN KEY ("heroImage") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;
