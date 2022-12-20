/*
  Warnings:

  - You are about to drop the column `eventStatus` on the `Event` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "eventStatus";

-- DropEnum
DROP TYPE "EventEventStatusType";
