/*
  Warnings:

  - A unique constraint covering the columns `[firebaseId]` on the table `Member` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[customId]` on the table `Member` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Member_firebaseId_key" ON "Member"("firebaseId");

-- CreateIndex
CREATE UNIQUE INDEX "Member_customId_key" ON "Member"("customId");
