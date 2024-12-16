/*
  Warnings:

  - A unique constraint covering the columns `[publisher]` on the table `Member` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "publisher" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Member_publisher_key" ON "Member"("publisher");

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_publisher_fkey" FOREIGN KEY ("publisher") REFERENCES "Publisher"("id") ON DELETE SET NULL ON UPDATE CASCADE;
