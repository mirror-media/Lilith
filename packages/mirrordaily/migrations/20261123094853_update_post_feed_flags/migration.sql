/*
  Warnings:

  - You are about to drop the column `notLine` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `notYahoo` on the `Post` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Post" DROP COLUMN "notLine",
DROP COLUMN "notYahoo",
ADD COLUMN     "notExternalFeed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notPartnerCms" BOOLEAN NOT NULL DEFAULT false;
