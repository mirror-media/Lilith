/*
  Warnings:

  - You are about to drop the column `slug` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `Column` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `Resource` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `Section` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `Specialfeature` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `SpecialfeatureList` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `Tag` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Category_slug_key";

-- DropIndex
DROP INDEX "Column_slug_key";

-- DropIndex
DROP INDEX "Event_slug_key";

-- DropIndex
DROP INDEX "Job_slug_key";

-- DropIndex
DROP INDEX "Post_slug_key";

-- DropIndex
DROP INDEX "Resource_slug_key";

-- DropIndex
DROP INDEX "Section_slug_key";

-- DropIndex
DROP INDEX "Specialfeature_slug_key";

-- DropIndex
DROP INDEX "SpecialfeatureList_slug_key";

-- DropIndex
DROP INDEX "Tag_slug_key";

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "slug";

-- AlterTable
ALTER TABLE "Column" DROP COLUMN "slug";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "slug";

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "slug";

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "slug",
ADD COLUMN     "apiData" JSONB;

-- AlterTable
ALTER TABLE "Resource" DROP COLUMN "slug";

-- AlterTable
ALTER TABLE "Section" DROP COLUMN "slug";

-- AlterTable
ALTER TABLE "Specialfeature" DROP COLUMN "slug";

-- AlterTable
ALTER TABLE "SpecialfeatureList" DROP COLUMN "slug";

-- AlterTable
ALTER TABLE "Tag" DROP COLUMN "slug";
