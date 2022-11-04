/*
  Warnings:

  - You are about to drop the column `uti` on the `FormResult` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "FormResult" DROP COLUMN "uti",
ADD COLUMN     "uri" TEXT NOT NULL DEFAULT E'';
