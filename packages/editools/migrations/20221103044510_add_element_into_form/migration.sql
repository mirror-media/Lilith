/*
  Warnings:

  - Added the required column `element` to the `Form` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FormElementType" AS ENUM ('like', 'feedback', 'all');

-- AlterTable
ALTER TABLE "Form" ADD COLUMN     "element" "FormElementType";
