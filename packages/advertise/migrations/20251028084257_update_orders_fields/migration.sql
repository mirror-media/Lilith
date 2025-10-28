/*
  Warnings:

  - You are about to drop the column `type` on the `Order` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[orderNumber]` on the table `Order` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable: Drop type column and add orderNumber (temporarily nullable)
ALTER TABLE "Order" DROP COLUMN "type",
ADD COLUMN "orderNumber" TEXT;

-- Update existing records with unique order numbers based on their ID
UPDATE "Order" SET "orderNumber" = 'ORD-' || LPAD(id::TEXT, 8, '0') WHERE "orderNumber" IS NULL;

-- Now make orderNumber NOT NULL with default empty string for new records
ALTER TABLE "Order" ALTER COLUMN "orderNumber" SET NOT NULL,
ALTER COLUMN "orderNumber" SET DEFAULT '';

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");
