-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "isReviewed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "needsModification" BOOLEAN NOT NULL DEFAULT false;
