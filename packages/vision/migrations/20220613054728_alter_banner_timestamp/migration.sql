/*
  Warnings:

  - You are about to drop the column `active` on the `Banner` table. All the data in the column will be lost.
  - Added the required column `register_end` to the `Banner` table without a default value. This is not possible if the table is not empty.
  - Added the required column `register_start` to the `Banner` table without a default value. This is not possible if the table is not empty.
  - Made the column `register_end` on table `Event` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Banner" DROP COLUMN "active",
ADD COLUMN     "register_end" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "register_start" TIMESTAMP(3) NOT NULL;
