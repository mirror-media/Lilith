/*
  Warnings:

  - You are about to drop the column `apiData` on the `About` table. All the data in the column will be lost.
  - You are about to drop the column `copyright` on the `Image` table. All the data in the column will be lost.
  - Made the column `aboutUs` on table `About` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "About" DROP COLUMN "apiData",
ALTER COLUMN "aboutUs" SET NOT NULL,
ALTER COLUMN "aboutUs" SET DEFAULT E'',
ALTER COLUMN "aboutUs" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Image" DROP COLUMN "copyright";
