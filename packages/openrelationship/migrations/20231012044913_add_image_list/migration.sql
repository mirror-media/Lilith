/*
  Warnings:

  - You are about to drop the column `sLogo` on the `FactcheckPartner` table. All the data in the column will be lost.
  - The `logo` column on the `FactcheckPartner` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "FactcheckPartner" DROP COLUMN "sLogo",
ADD COLUMN     "slogo" INTEGER,
DROP COLUMN "logo",
ADD COLUMN     "logo" INTEGER;

-- CreateTable
CREATE TABLE "Image" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "imageFile_filesize" INTEGER,
    "imageFile_extension" TEXT,
    "imageFile_width" INTEGER,
    "imageFile_height" INTEGER,
    "imageFile_id" TEXT,
    "file_filesize" INTEGER,
    "file_filename" TEXT,
    "urlOriginal" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Image_createdBy_idx" ON "Image"("createdBy");

-- CreateIndex
CREATE INDEX "Image_updatedBy_idx" ON "Image"("updatedBy");

-- CreateIndex
CREATE INDEX "FactcheckPartner_logo_idx" ON "FactcheckPartner"("logo");

-- CreateIndex
CREATE INDEX "FactcheckPartner_slogo_idx" ON "FactcheckPartner"("slogo");

-- AddForeignKey
ALTER TABLE "FactcheckPartner" ADD CONSTRAINT "FactcheckPartner_logo_fkey" FOREIGN KEY ("logo") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FactcheckPartner" ADD CONSTRAINT "FactcheckPartner_slogo_fkey" FOREIGN KEY ("slogo") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
