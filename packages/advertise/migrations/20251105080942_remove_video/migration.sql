/*
  Warnings:

  - You are about to drop the `Video` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Video" DROP CONSTRAINT "Video_coverPhoto_fkey";

-- DropForeignKey
ALTER TABLE "Video" DROP CONSTRAINT "Video_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "Video" DROP CONSTRAINT "Video_updatedBy_fkey";

-- DropTable
DROP TABLE "Video";
