/*
  Warnings:

  - The `brief` column on the `External` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `content` column on the `External` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "External" DROP COLUMN "brief",
ADD COLUMN     "brief" JSONB,
DROP COLUMN "content",
ADD COLUMN     "content" JSONB;
