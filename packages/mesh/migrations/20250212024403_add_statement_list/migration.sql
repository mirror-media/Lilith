-- CreateEnum
CREATE TYPE "StatementTypeType" AS ENUM ('month', 'quarter', 'semi_annual');

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
CREATE INDEX "Statement_publisher_idx" ON "Statement"("publisher");

-- CreateIndex
CREATE INDEX "Statement_createdBy_idx" ON "Statement"("createdBy");

-- CreateIndex
CREATE INDEX "Statement_updatedBy_idx" ON "Statement"("updatedBy");

-- AddForeignKey
ALTER TABLE "Statement" ADD CONSTRAINT "Statement_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Statement" ADD CONSTRAINT "Statement_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Statement" ADD CONSTRAINT "Statement_publisher_fkey" FOREIGN KEY ("publisher") REFERENCES "Publisher"("id") ON DELETE SET NULL ON UPDATE CASCADE;
