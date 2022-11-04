/*
  Warnings:

  - You are about to drop the column `element` on the `Form` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Form" DROP COLUMN "element";

-- DropEnum
DROP TYPE "FormElementType";
