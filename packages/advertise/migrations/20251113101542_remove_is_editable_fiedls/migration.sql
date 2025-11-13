/*
  Warnings:

  - You are about to drop the column `imageEditable` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `nameEditable` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `paragraphOneEditable` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `paragraphTwoEditable` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `scheduleEditable` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "imageEditable",
DROP COLUMN "nameEditable",
DROP COLUMN "paragraphOneEditable",
DROP COLUMN "paragraphTwoEditable",
DROP COLUMN "scheduleEditable";
