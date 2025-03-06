/*
  Warnings:

  - The values [quarter] on the enum `StatementTypeType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "StatementTypeType_new" AS ENUM ('month', 'media', 'semi_annual');
ALTER TABLE "Statement" ALTER COLUMN "type" TYPE "StatementTypeType_new" USING ("type"::text::"StatementTypeType_new");
ALTER TYPE "StatementTypeType" RENAME TO "StatementTypeType_old";
ALTER TYPE "StatementTypeType_new" RENAME TO "StatementTypeType";
DROP TYPE "StatementTypeType_old";
COMMIT;
