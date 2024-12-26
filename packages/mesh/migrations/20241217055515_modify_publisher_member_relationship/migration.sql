/*
  Warnings:

  - You are about to drop the column `publisher` on the `Member` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Member" DROP CONSTRAINT "Member_publisher_fkey";

-- DropIndex
DROP INDEX "Member_publisher_key";

-- AlterTable
ALTER TABLE "Member" DROP COLUMN "publisher";

-- AlterTable
ALTER TABLE "Publisher" ADD COLUMN     "admin" INTEGER;

-- CreateIndex
CREATE INDEX "Publisher_admin_idx" ON "Publisher"("admin");

-- AddForeignKey
ALTER TABLE "Publisher" ADD CONSTRAINT "Publisher_admin_fkey" FOREIGN KEY ("admin") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;
