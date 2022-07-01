/*
  Warnings:

  - Changed the type of `order` on the `ConditionCollection` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "ConditionCollection" DROP COLUMN "order",
ADD COLUMN     "order" INTEGER NOT NULL;
