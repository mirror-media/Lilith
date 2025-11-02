/*
  Warnings:

  - Made the column `schedule` on table `Order` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Member" ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "email" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "type" DROP NOT NULL,
ALTER COLUMN "state" DROP NOT NULL,
ALTER COLUMN "schedule" SET NOT NULL,
ALTER COLUMN "schedule" SET DEFAULT '';
