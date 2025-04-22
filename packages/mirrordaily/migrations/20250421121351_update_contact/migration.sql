/*
  Warnings:

  - The values [vocal] on the enum `ContactRoleType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ContactRoleType_new" AS ENUM ('writer', 'photographer', 'camera_man', 'designer', 'engineer');
ALTER TABLE "Contact" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "Contact" ALTER COLUMN "role" TYPE "ContactRoleType_new" USING ("role"::text::"ContactRoleType_new");
ALTER TYPE "ContactRoleType" RENAME TO "ContactRoleType_old";
ALTER TYPE "ContactRoleType_new" RENAME TO "ContactRoleType";
DROP TYPE "ContactRoleType_old";
ALTER TABLE "Contact" ALTER COLUMN "role" SET DEFAULT 'writer';
COMMIT;
