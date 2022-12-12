/*
  Warnings:

  - The values [scheduled] on the enum `EditorChoiceStatusType` will be removed. If these variants are still used in the database, this will fail.
  - The values [scheduled] on the enum `EventBannerStatusType` will be removed. If these variants are still used in the database, this will fail.
  - The values [scheduled] on the enum `HomepageBannerStatusType` will be removed. If these variants are still used in the database, this will fail.
  - The values [scheduled] on the enum `JobBannerStatusType` will be removed. If these variants are still used in the database, this will fail.
  - The values [scheduled] on the enum `JobStatusType` will be removed. If these variants are still used in the database, this will fail.
  - The values [scheduled] on the enum `PostStatusType` will be removed. If these variants are still used in the database, this will fail.
  - The values [scheduled] on the enum `ResourceBannerStatusType` will be removed. If these variants are still used in the database, this will fail.
  - The values [scheduled] on the enum `ResourceStatusType` will be removed. If these variants are still used in the database, this will fail.
  - The values [scheduled] on the enum `SpecialfeatureEditorChoiceStatusType` will be removed. If these variants are still used in the database, this will fail.
  - The values [scheduled] on the enum `SpecialfeatureListStatusType` will be removed. If these variants are still used in the database, this will fail.
  - The values [scheduled] on the enum `SpecialfeatureStatusType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EditorChoiceStatusType_new" AS ENUM ('published', 'draft', 'archived');
ALTER TABLE "EditorChoice" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "EditorChoice" ALTER COLUMN "status" TYPE "EditorChoiceStatusType_new" USING ("status"::text::"EditorChoiceStatusType_new");
ALTER TYPE "EditorChoiceStatusType" RENAME TO "EditorChoiceStatusType_old";
ALTER TYPE "EditorChoiceStatusType_new" RENAME TO "EditorChoiceStatusType";
DROP TYPE "EditorChoiceStatusType_old";
ALTER TABLE "EditorChoice" ALTER COLUMN "status" SET DEFAULT 'draft';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "EventBannerStatusType_new" AS ENUM ('published', 'draft', 'archived');
ALTER TABLE "EventBanner" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "EventBanner" ALTER COLUMN "status" TYPE "EventBannerStatusType_new" USING ("status"::text::"EventBannerStatusType_new");
ALTER TYPE "EventBannerStatusType" RENAME TO "EventBannerStatusType_old";
ALTER TYPE "EventBannerStatusType_new" RENAME TO "EventBannerStatusType";
DROP TYPE "EventBannerStatusType_old";
ALTER TABLE "EventBanner" ALTER COLUMN "status" SET DEFAULT 'draft';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "HomepageBannerStatusType_new" AS ENUM ('published', 'draft', 'archived');
ALTER TABLE "HomepageBanner" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "HomepageBanner" ALTER COLUMN "status" TYPE "HomepageBannerStatusType_new" USING ("status"::text::"HomepageBannerStatusType_new");
ALTER TYPE "HomepageBannerStatusType" RENAME TO "HomepageBannerStatusType_old";
ALTER TYPE "HomepageBannerStatusType_new" RENAME TO "HomepageBannerStatusType";
DROP TYPE "HomepageBannerStatusType_old";
ALTER TABLE "HomepageBanner" ALTER COLUMN "status" SET DEFAULT 'draft';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "JobBannerStatusType_new" AS ENUM ('published', 'draft', 'archived');
ALTER TABLE "JobBanner" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "JobBanner" ALTER COLUMN "status" TYPE "JobBannerStatusType_new" USING ("status"::text::"JobBannerStatusType_new");
ALTER TYPE "JobBannerStatusType" RENAME TO "JobBannerStatusType_old";
ALTER TYPE "JobBannerStatusType_new" RENAME TO "JobBannerStatusType";
DROP TYPE "JobBannerStatusType_old";
ALTER TABLE "JobBanner" ALTER COLUMN "status" SET DEFAULT 'draft';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "JobStatusType_new" AS ENUM ('published', 'draft', 'archived');
ALTER TABLE "Job" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Job" ALTER COLUMN "status" TYPE "JobStatusType_new" USING ("status"::text::"JobStatusType_new");
ALTER TYPE "JobStatusType" RENAME TO "JobStatusType_old";
ALTER TYPE "JobStatusType_new" RENAME TO "JobStatusType";
DROP TYPE "JobStatusType_old";
ALTER TABLE "Job" ALTER COLUMN "status" SET DEFAULT 'draft';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "PostStatusType_new" AS ENUM ('published', 'draft', 'archived');
ALTER TABLE "Post" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Post" ALTER COLUMN "status" TYPE "PostStatusType_new" USING ("status"::text::"PostStatusType_new");
ALTER TYPE "PostStatusType" RENAME TO "PostStatusType_old";
ALTER TYPE "PostStatusType_new" RENAME TO "PostStatusType";
DROP TYPE "PostStatusType_old";
ALTER TABLE "Post" ALTER COLUMN "status" SET DEFAULT 'draft';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ResourceBannerStatusType_new" AS ENUM ('published', 'draft', 'archived');
ALTER TABLE "ResourceBanner" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "ResourceBanner" ALTER COLUMN "status" TYPE "ResourceBannerStatusType_new" USING ("status"::text::"ResourceBannerStatusType_new");
ALTER TYPE "ResourceBannerStatusType" RENAME TO "ResourceBannerStatusType_old";
ALTER TYPE "ResourceBannerStatusType_new" RENAME TO "ResourceBannerStatusType";
DROP TYPE "ResourceBannerStatusType_old";
ALTER TABLE "ResourceBanner" ALTER COLUMN "status" SET DEFAULT 'draft';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ResourceStatusType_new" AS ENUM ('published', 'draft', 'archived');
ALTER TABLE "Resource" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Resource" ALTER COLUMN "status" TYPE "ResourceStatusType_new" USING ("status"::text::"ResourceStatusType_new");
ALTER TYPE "ResourceStatusType" RENAME TO "ResourceStatusType_old";
ALTER TYPE "ResourceStatusType_new" RENAME TO "ResourceStatusType";
DROP TYPE "ResourceStatusType_old";
ALTER TABLE "Resource" ALTER COLUMN "status" SET DEFAULT 'draft';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "SpecialfeatureEditorChoiceStatusType_new" AS ENUM ('published', 'draft', 'archived');
ALTER TABLE "SpecialfeatureEditorChoice" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "SpecialfeatureEditorChoice" ALTER COLUMN "status" TYPE "SpecialfeatureEditorChoiceStatusType_new" USING ("status"::text::"SpecialfeatureEditorChoiceStatusType_new");
ALTER TYPE "SpecialfeatureEditorChoiceStatusType" RENAME TO "SpecialfeatureEditorChoiceStatusType_old";
ALTER TYPE "SpecialfeatureEditorChoiceStatusType_new" RENAME TO "SpecialfeatureEditorChoiceStatusType";
DROP TYPE "SpecialfeatureEditorChoiceStatusType_old";
ALTER TABLE "SpecialfeatureEditorChoice" ALTER COLUMN "status" SET DEFAULT 'draft';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "SpecialfeatureListStatusType_new" AS ENUM ('published', 'draft', 'archived');
ALTER TABLE "SpecialfeatureList" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "SpecialfeatureList" ALTER COLUMN "status" TYPE "SpecialfeatureListStatusType_new" USING ("status"::text::"SpecialfeatureListStatusType_new");
ALTER TYPE "SpecialfeatureListStatusType" RENAME TO "SpecialfeatureListStatusType_old";
ALTER TYPE "SpecialfeatureListStatusType_new" RENAME TO "SpecialfeatureListStatusType";
DROP TYPE "SpecialfeatureListStatusType_old";
ALTER TABLE "SpecialfeatureList" ALTER COLUMN "status" SET DEFAULT 'draft';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "SpecialfeatureStatusType_new" AS ENUM ('published', 'draft', 'archived');
ALTER TABLE "Specialfeature" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Specialfeature" ALTER COLUMN "status" TYPE "SpecialfeatureStatusType_new" USING ("status"::text::"SpecialfeatureStatusType_new");
ALTER TYPE "SpecialfeatureStatusType" RENAME TO "SpecialfeatureStatusType_old";
ALTER TYPE "SpecialfeatureStatusType_new" RENAME TO "SpecialfeatureStatusType";
DROP TYPE "SpecialfeatureStatusType_old";
ALTER TABLE "Specialfeature" ALTER COLUMN "status" SET DEFAULT 'draft';
COMMIT;

-- AlterTable
ALTER TABLE "EventBanner" ALTER COLUMN "publishDate" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "HomepageBanner" ALTER COLUMN "publishDate" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "JobBanner" ALTER COLUMN "publishDate" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "ResourceBanner" ALTER COLUMN "publishDate" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "SpecialfeatureEditorChoice" ALTER COLUMN "publishDate" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "SpecialfeatureList" ALTER COLUMN "publishDate" SET DEFAULT CURRENT_TIMESTAMP;
