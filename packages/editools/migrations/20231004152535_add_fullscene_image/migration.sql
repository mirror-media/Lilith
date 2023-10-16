/*
  Warnings:

  - You are about to drop the column `shiftLeft` on the `DualSlide` table. All the data in the column will be lost.
  - You are about to drop the column `shiftLeft` on the `Theatre` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DualSlide" DROP COLUMN "shiftLeft";

-- AlterTable
ALTER TABLE "Theatre" DROP COLUMN "shiftLeft";

-- CreateTable
CREATE TABLE "FullScene" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "desc" TEXT NOT NULL DEFAULT '',
    "imageFile_filesize" INTEGER,
    "imageFile_extension" TEXT,
    "imageFile_width" INTEGER,
    "imageFile_height" INTEGER,
    "imageFile_id" TEXT,
    "displayMode" TEXT DEFAULT 'container',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "FullScene_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FullScene_createdBy_idx" ON "FullScene"("createdBy");

-- CreateIndex
CREATE INDEX "FullScene_updatedBy_idx" ON "FullScene"("updatedBy");

-- AddForeignKey
ALTER TABLE "FullScene" ADD CONSTRAINT "FullScene_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FullScene" ADD CONSTRAINT "FullScene_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
