/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Member` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Member" ALTER COLUMN "firebaseId" DROP NOT NULL,
ALTER COLUMN "firebaseId" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "Member_email_key" ON "Member"("email");
