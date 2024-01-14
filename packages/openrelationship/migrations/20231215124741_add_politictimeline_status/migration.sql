/*
  Warnings:

  - You are about to drop the column `checked` on the `PoliticTimeline` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PoliticTimeline" DROP COLUMN "checked",
ADD COLUMN     "status" TEXT DEFAULT 'notverified';

-- CreateIndex
CREATE INDEX "PoliticTimeline_status_idx" ON "PoliticTimeline"("status");
