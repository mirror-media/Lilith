-- CreateEnum
CREATE TYPE "ContactRoleType" AS ENUM ('writer', 'photographer', 'camera_man', 'designer');

-- AlterTable
ALTER TABLE "Contact" ADD COLUMN     "role" "ContactRoleType" DEFAULT 'writer';
