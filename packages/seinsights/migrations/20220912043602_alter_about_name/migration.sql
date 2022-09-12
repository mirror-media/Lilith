/*
  Warnings:

  - You are about to drop the `AboutUs` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AboutUs" DROP CONSTRAINT "AboutUs_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "AboutUs" DROP CONSTRAINT "AboutUs_updatedBy_fkey";

-- DropTable
DROP TABLE "AboutUs";

-- CreateTable
CREATE TABLE "About" (
    "id" SERIAL NOT NULL,
    "aboutUs" JSONB,
    "apiData" JSONB,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "About_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "About_createdBy_idx" ON "About"("createdBy");

-- CreateIndex
CREATE INDEX "About_updatedBy_idx" ON "About"("updatedBy");

-- AddForeignKey
ALTER TABLE "About" ADD CONSTRAINT "About_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "About" ADD CONSTRAINT "About_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
