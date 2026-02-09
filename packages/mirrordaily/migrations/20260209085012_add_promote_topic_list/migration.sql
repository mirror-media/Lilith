/*
  Warnings:

  - You are about to drop the column `isPromoted` on the `Topic` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Topic" DROP COLUMN "isPromoted";

-- CreateTable
CREATE TABLE "PromoteTopic" (
    "id" SERIAL NOT NULL,
    "order" INTEGER,
    "topics" INTEGER,
    "state" TEXT DEFAULT 'draft',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "PromoteTopic_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PromoteTopic_order_key" ON "PromoteTopic"("order");

-- CreateIndex
CREATE INDEX "PromoteTopic_topics_idx" ON "PromoteTopic"("topics");

-- CreateIndex
CREATE INDEX "PromoteTopic_state_idx" ON "PromoteTopic"("state");

-- CreateIndex
CREATE INDEX "PromoteTopic_createdBy_idx" ON "PromoteTopic"("createdBy");

-- CreateIndex
CREATE INDEX "PromoteTopic_updatedBy_idx" ON "PromoteTopic"("updatedBy");

-- AddForeignKey
ALTER TABLE "PromoteTopic" ADD CONSTRAINT "PromoteTopic_topics_fkey" FOREIGN KEY ("topics") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromoteTopic" ADD CONSTRAINT "PromoteTopic_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromoteTopic" ADD CONSTRAINT "PromoteTopic_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
