-- DropIndex
DROP INDEX "Member_customId_key";

-- DropIndex
DROP INDEX "Member_firebaseId_key";

-- AlterTable
ALTER TABLE "Publisher" ADD COLUMN     "paywall" BOOLEAN NOT NULL DEFAULT false;
