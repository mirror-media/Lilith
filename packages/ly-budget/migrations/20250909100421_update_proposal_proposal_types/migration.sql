/*
  Warnings:

  - You are about to drop the column `proposalTypes` on the `Proposal` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Proposal" DROP COLUMN "proposalTypes",
ADD COLUMN     "proposal_types" JSONB NOT NULL DEFAULT '[]';
