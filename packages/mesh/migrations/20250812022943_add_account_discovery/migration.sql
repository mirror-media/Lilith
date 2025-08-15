/*
  Warnings:

  - The `is_successful` column on the `AccountDiscovery` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "AccountDiscovery" DROP COLUMN "is_successful",
ADD COLUMN     "is_successful" BOOLEAN NOT NULL DEFAULT true;

-- DropEnum
DROP TYPE "AccountDiscoveryIsSuccessfulType";
