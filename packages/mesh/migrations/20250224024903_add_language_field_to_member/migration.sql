-- CreateEnum
CREATE TYPE "MemberLanguageType" AS ENUM ('zh_TW', 'zh_CN', 'en_US', 'en_GB', 'ja_JP', 'fr_FR', 'de_DE');

-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "language" "MemberLanguageType" DEFAULT E'zh_TW';
