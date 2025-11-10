/*
  Warnings:

  - You are about to drop the column `schedule` on the `Order` table. All the data in the column will be lost.

*/
ALTER TABLE "Order" ADD COLUMN "scheduleStartDate" TIMESTAMP(3),
ADD COLUMN "scheduleEndDate" TIMESTAMP(3);

UPDATE "Order"
SET "scheduleStartDate" = CASE
    WHEN "schedule" IS NOT NULL AND "schedule" != ''
    THEN TO_TIMESTAMP("schedule", 'YYYY-MM-DD')::TIMESTAMP
    ELSE NULL
END,
"scheduleEndDate" = CASE
    WHEN "schedule" IS NOT NULL AND "schedule" != ''
    THEN TO_TIMESTAMP("schedule", 'YYYY-MM-DD')::TIMESTAMP
    ELSE NULL
END
WHERE "schedule" IS NOT NULL;

ALTER TABLE "Order" DROP COLUMN "schedule";
