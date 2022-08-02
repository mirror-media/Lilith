/*
  Warnings:

  - Made the column `startTime` on table `Poll` required. This step will fail if there are existing NULL values in that column.
  - Made the column `endTime` on table `Poll` required. This step will fail if there are existing NULL values in that column.
  - Made the column `publishTime` on table `Poll` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Poll" ALTER COLUMN "startTime" SET NOT NULL,
ALTER COLUMN "endTime" SET NOT NULL,
ALTER COLUMN "publishTime" SET NOT NULL,
ALTER COLUMN "publishTime" SET DEFAULT CURRENT_TIMESTAMP;
