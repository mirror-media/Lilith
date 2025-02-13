/*
  Warnings:

  - A unique constraint covering the columns `[customId]` on the table `Publisher` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Publisher" ADD COLUMN     "podcast_url" TEXT NOT NULL DEFAULT E'';

-- CreateIndex
CREATE UNIQUE INDEX "Publisher_customId_key" ON "Publisher"("customId");
