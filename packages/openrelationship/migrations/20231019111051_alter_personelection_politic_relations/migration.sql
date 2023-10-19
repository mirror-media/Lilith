/*
  Warnings:

  - You are about to drop the `_Politic_person` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_Politic_person" DROP CONSTRAINT "_Politic_person_A_fkey";

-- DropForeignKey
ALTER TABLE "_Politic_person" DROP CONSTRAINT "_Politic_person_B_fkey";

-- DropTable
DROP TABLE "_Politic_person";
