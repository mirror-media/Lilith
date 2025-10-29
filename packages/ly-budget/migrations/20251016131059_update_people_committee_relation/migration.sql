/*
  Warnings:

  - You are about to drop the `_People_committees` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_People_committees" DROP CONSTRAINT "_People_committees_A_fkey";

-- DropForeignKey
ALTER TABLE "_People_committees" DROP CONSTRAINT "_People_committees_B_fkey";

-- AlterTable
ALTER TABLE "Proposal" ALTER COLUMN "react_angry" SET DEFAULT 0,
ALTER COLUMN "react_disappoint" SET DEFAULT 0,
ALTER COLUMN "react_good" SET DEFAULT 0,
ALTER COLUMN "react_whatever" SET DEFAULT 0;

-- DropTable
DROP TABLE "_People_committees";
