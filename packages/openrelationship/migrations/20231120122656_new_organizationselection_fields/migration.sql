/*
  Warnings:

  - You are about to drop the `_Election_organizationsElection` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_Election_organizationsElection" DROP CONSTRAINT "_Election_organizationsElection_A_fkey";

-- DropForeignKey
ALTER TABLE "_Election_organizationsElection" DROP CONSTRAINT "_Election_organizationsElection_B_fkey";

-- AlterTable
ALTER TABLE "OrganizationsElection" ADD COLUMN     "first_obtained_number" TEXT DEFAULT '',
ADD COLUMN     "second_obtained_number" TEXT DEFAULT '';

-- DropTable
DROP TABLE "_Election_organizationsElection";
