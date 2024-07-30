/*
  Warnings:

  - You are about to drop the `_Transaction_member` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_Transaction_member" DROP CONSTRAINT "_Transaction_member_A_fkey";

-- DropForeignKey
ALTER TABLE "_Transaction_member" DROP CONSTRAINT "_Transaction_member_B_fkey";

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "member" INTEGER;

-- DropTable
DROP TABLE "_Transaction_member";

-- CreateIndex
CREATE INDEX "Transaction_member_idx" ON "Transaction"("member");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_member_fkey" FOREIGN KEY ("member") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;
