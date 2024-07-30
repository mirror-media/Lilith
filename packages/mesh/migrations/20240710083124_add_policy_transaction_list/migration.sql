-- CreateEnum
CREATE TYPE "PolicyTypeType" AS ENUM ('deposit', 'unlock_all_publishers', 'unlock_one_publisher');

-- CreateEnum
CREATE TYPE "TransactionStatusType" AS ENUM ('Success', 'Failed');

-- CreateTable
CREATE TABLE "Policy" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "explanation" TEXT NOT NULL DEFAULT E'',
    "type" "PolicyTypeType",
    "unlockSingle" BOOLEAN NOT NULL DEFAULT false,
    "publisher" INTEGER,
    "duration" INTEGER,
    "charge" DOUBLE PRECISION DEFAULT 0,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Policy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" SERIAL NOT NULL,
    "policy" INTEGER,
    "tid" TEXT NOT NULL DEFAULT E'',
    "depositVolume" DOUBLE PRECISION,
    "unlockStory" INTEGER,
    "expireDate" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "status" "TransactionStatusType",
    "complement" TEXT NOT NULL DEFAULT E'',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_Transaction_member" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE INDEX "Policy_publisher_idx" ON "Policy"("publisher");

-- CreateIndex
CREATE INDEX "Policy_createdBy_idx" ON "Policy"("createdBy");

-- CreateIndex
CREATE INDEX "Policy_updatedBy_idx" ON "Policy"("updatedBy");

-- CreateIndex
CREATE INDEX "Transaction_policy_idx" ON "Transaction"("policy");

-- CreateIndex
CREATE INDEX "Transaction_unlockStory_idx" ON "Transaction"("unlockStory");

-- CreateIndex
CREATE INDEX "Transaction_createdBy_idx" ON "Transaction"("createdBy");

-- CreateIndex
CREATE INDEX "Transaction_updatedBy_idx" ON "Transaction"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "_Transaction_member_AB_unique" ON "_Transaction_member"("A", "B");

-- CreateIndex
CREATE INDEX "_Transaction_member_B_index" ON "_Transaction_member"("B");

-- AddForeignKey
ALTER TABLE "Policy" ADD CONSTRAINT "Policy_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Policy" ADD CONSTRAINT "Policy_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Policy" ADD CONSTRAINT "Policy_publisher_fkey" FOREIGN KEY ("publisher") REFERENCES "Publisher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_unlockStory_fkey" FOREIGN KEY ("unlockStory") REFERENCES "Story"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_policy_fkey" FOREIGN KEY ("policy") REFERENCES "Policy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Transaction_member" ADD FOREIGN KEY ("A") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Transaction_member" ADD FOREIGN KEY ("B") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
