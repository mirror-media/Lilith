/*
  Warnings:

  - You are about to drop the column `isWatermark` on the `Image` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Image" DROP COLUMN "isWatermark",
ADD COLUMN     "waterMark" BOOLEAN NOT NULL DEFAULT true;
