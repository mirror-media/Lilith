/*
  Warnings:

  - You are about to drop the column `heroimage` on the `EditorChoice` table. All the data in the column will be lost.
  - You are about to drop the column `descriptions` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `sortorder` on the `Game` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "EditorChoice" DROP COLUMN IF EXISTS "heroimage";
ALTER TABLE "EditorChoice" DROP COLUMN IF EXISTS "publishedDate";
ALTER TABLE "EditorChoice" ADD COLUMN "heroImage" INTEGER;

-- AlterTable
ALTER TABLE "Game" DROP COLUMN IF EXISTS "descriptions";
ALTER TABLE "Game" DROP COLUMN IF EXISTS "sortorder";
ALTER TABLE "Game"
ADD COLUMN "descriptions" TEXT NOT NULL DEFAULT '',
ADD COLUMN "sortOrder" INTEGER;

-- CreateIndex
CREATE INDEX "EditorChoice_heroImage_idx" ON "EditorChoice"("heroImage");

-- AddForeignKey
ALTER TABLE "EditorChoice" ADD CONSTRAINT "EditorChoice_heroImage_fkey" FOREIGN KEY ("heroImage") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;
