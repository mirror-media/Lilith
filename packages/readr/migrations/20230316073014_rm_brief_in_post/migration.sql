/*
  Warnings:

  - You are about to drop the column `brief` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `briefApiData` on the `Post` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Post" DROP COLUMN "brief",
DROP COLUMN "briefApiData";
