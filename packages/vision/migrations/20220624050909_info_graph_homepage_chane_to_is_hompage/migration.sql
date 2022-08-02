/*
  Warnings:

  - You are about to drop the column `homepage` on the `InfoGraph` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "InfoGraph" DROP COLUMN "homepage",
ADD COLUMN     "isHomepage" BOOLEAN NOT NULL DEFAULT false;
