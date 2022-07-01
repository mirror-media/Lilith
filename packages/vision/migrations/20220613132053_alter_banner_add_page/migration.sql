/*
  Warnings:

  - Added the required column `page` to the `Banner` table without a default value. This is not possible if the table is not empty.
  - Made the column `register_end` on table `Event` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Banner" ADD COLUMN     "page" TEXT NOT NULL;
