-- CreateEnum
CREATE TYPE "ExchangeStatusType" AS ENUM ('Success', 'Failed');

-- CreateTable
CREATE TABLE "Exchange" (
    "id" SERIAL NOT NULL,
    "publisher" INTEGER,
    "tid" TEXT NOT NULL DEFAULT E'',
    "exchangeVolume" DOUBLE PRECISION NOT NULL,
    "status" "ExchangeStatusType",
    "complement" TEXT NOT NULL DEFAULT E'',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Exchange_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Exchange_publisher_idx" ON "Exchange"("publisher");

-- CreateIndex
CREATE INDEX "Exchange_createdBy_idx" ON "Exchange"("createdBy");

-- CreateIndex
CREATE INDEX "Exchange_updatedBy_idx" ON "Exchange"("updatedBy");

-- AddForeignKey
ALTER TABLE "Exchange" ADD CONSTRAINT "Exchange_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exchange" ADD CONSTRAINT "Exchange_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exchange" ADD CONSTRAINT "Exchange_publisher_fkey" FOREIGN KEY ("publisher") REFERENCES "Publisher"("id") ON DELETE SET NULL ON UPDATE CASCADE;
