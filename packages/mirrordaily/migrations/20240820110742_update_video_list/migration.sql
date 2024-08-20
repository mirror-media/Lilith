/*
  Warnings:

  - You are about to drop the column `apiData` on the `Video` table. All the data in the column will be lost.
  - You are about to drop the column `urlOriginal` on the `Video` table. All the data in the column will be lost.
  - Made the column `content` on table `Video` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Video" DROP COLUMN "apiData",
DROP COLUMN "urlOriginal",
ADD COLUMN     "isShorts" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "uploader" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "uploaderEmail" TEXT NOT NULL DEFAULT '',
ALTER COLUMN "content" SET NOT NULL,
ALTER COLUMN "content" SET DEFAULT '',
ALTER COLUMN "content" SET DATA TYPE TEXT;
