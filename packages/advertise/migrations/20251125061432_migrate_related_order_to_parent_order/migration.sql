/*
  Add parentOrder column and migrate data from relatedOrder.
  Keep relatedOrder for backward compatibility with API.
*/

-- Step 1: Add the new parentOrder column
ALTER TABLE "Order" ADD COLUMN "parentOrder" INTEGER;

-- Step 2: Migrate data from relatedOrder to parentOrder
-- For each order that has a relatedOrder (child), set that child's parentOrder to point back to this order (parent)
UPDATE "Order" AS child
SET "parentOrder" = parent.id
FROM "Order" AS parent
WHERE parent."relatedOrder" = child.id;

-- Step 3: Create index and foreign key for the new parentOrder column
CREATE INDEX "Order_parentOrder_idx" ON "Order"("parentOrder");
ALTER TABLE "Order" ADD CONSTRAINT "Order_parentOrder_fkey" FOREIGN KEY ("parentOrder") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
