-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "imageEditable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "paragraphOneEditable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "paragraphTwoEditable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "scheduleEditable" BOOLEAN NOT NULL DEFAULT false;
