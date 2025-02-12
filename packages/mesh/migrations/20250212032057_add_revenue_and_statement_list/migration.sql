-- CreateEnum
CREATE TYPE "RevenueTypeType" AS ENUM ('story_ad_revenue', 'mutual_fund_revenue');

-- CreateEnum
CREATE TYPE "StatementTypeType" AS ENUM ('month', 'quarter', 'semi_annual');

-- CreateTable
CREATE TABLE "Revenue" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL DEFAULT E'',
    "publisher" INTEGER,
    "type" "RevenueTypeType",
    "value" DOUBLE PRECISION NOT NULL,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Revenue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Statement" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL DEFAULT E'',
    "publisher" INTEGER,
    "type" "StatementTypeType",
    "url" TEXT NOT NULL DEFAULT E'',
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Statement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Revenue_publisher_idx" ON "Revenue"("publisher");

-- CreateIndex
CREATE INDEX "Revenue_createdBy_idx" ON "Revenue"("createdBy");

-- CreateIndex
CREATE INDEX "Revenue_updatedBy_idx" ON "Revenue"("updatedBy");

-- CreateIndex
CREATE INDEX "Statement_publisher_idx" ON "Statement"("publisher");

-- CreateIndex
CREATE INDEX "Statement_createdBy_idx" ON "Statement"("createdBy");

-- CreateIndex
CREATE INDEX "Statement_updatedBy_idx" ON "Statement"("updatedBy");

-- CreateIndex
CREATE INDEX "Story_story_type_idx" ON "Story"("story_type");

-- AddForeignKey
ALTER TABLE "Revenue" ADD CONSTRAINT "Revenue_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Revenue" ADD CONSTRAINT "Revenue_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Revenue" ADD CONSTRAINT "Revenue_publisher_fkey" FOREIGN KEY ("publisher") REFERENCES "Publisher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Statement" ADD CONSTRAINT "Statement_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Statement" ADD CONSTRAINT "Statement_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Statement" ADD CONSTRAINT "Statement_publisher_fkey" FOREIGN KEY ("publisher") REFERENCES "Publisher"("id") ON DELETE SET NULL ON UPDATE CASCADE;
