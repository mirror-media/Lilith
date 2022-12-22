/*
  Warnings:

  - The values [scheduled] on the enum `EventStatusType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EventStatusType_new" AS ENUM ('published', 'draft', 'archived');
ALTER TABLE "Event" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Event" ALTER COLUMN "status" TYPE "EventStatusType_new" USING ("status"::text::"EventStatusType_new");
ALTER TYPE "EventStatusType" RENAME TO "EventStatusType_old";
ALTER TYPE "EventStatusType_new" RENAME TO "EventStatusType";
DROP TYPE "EventStatusType_old";
ALTER TABLE "Event" ALTER COLUMN "status" SET DEFAULT 'draft';
COMMIT;
