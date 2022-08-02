/*
  Warnings:

  - Made the column `register_end` on table `Event` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "register_end" SET NOT NULL;
