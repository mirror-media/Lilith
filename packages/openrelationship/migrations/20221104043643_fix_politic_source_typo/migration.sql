/*
  Warnings:

  - You are about to drop the column `politicrSource` on the `PersonElection` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PersonElection" DROP COLUMN "politicrSource",
ADD COLUMN     "politicSource" TEXT NOT NULL DEFAULT E'';
