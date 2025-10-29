/*
  Warnings:

  - A unique constraint covering the columns `[termNumber]` on the table `Term` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "People" DROP CONSTRAINT "People_party_fkey";

-- CreateTable
CREATE TABLE "Party" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Party_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Party_name_key" ON "Party"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Term_termNumber_key" ON "Term"("termNumber");

-- AddForeignKey
ALTER TABLE "People" ADD CONSTRAINT "People_party_fkey" FOREIGN KEY ("party") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;
