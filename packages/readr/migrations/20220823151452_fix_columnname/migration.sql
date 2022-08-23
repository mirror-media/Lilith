/*
  Warnings:

  - You are about to drop the column `publisheTime` on the `Post` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Post_publisheTime_idx";

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "publisheTime",
ADD COLUMN     "publishedTime" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Post_publishedTime_idx" ON "Post"("publishedTime");
