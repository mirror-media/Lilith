-- CreateEnum
CREATE TYPE "SponsorshipStatusType" AS ENUM ('Success', 'Failed');

-- CreateTable
CREATE TABLE "Sponsorship" (
    "id" SERIAL NOT NULL,
    "tid" TEXT NOT NULL DEFAULT E'',
    "sponsor" INTEGER,
    "publisher" INTEGER,
    "fee" DOUBLE PRECISION,
    "status" "SponsorshipStatusType",
    "complement" TEXT NOT NULL DEFAULT E'',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Sponsorship_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Sponsorship_sponsor_idx" ON "Sponsorship"("sponsor");

-- CreateIndex
CREATE INDEX "Sponsorship_publisher_idx" ON "Sponsorship"("publisher");

-- CreateIndex
CREATE INDEX "Sponsorship_createdBy_idx" ON "Sponsorship"("createdBy");

-- CreateIndex
CREATE INDEX "Sponsorship_updatedBy_idx" ON "Sponsorship"("updatedBy");

-- AddForeignKey
ALTER TABLE "Sponsorship" ADD CONSTRAINT "Sponsorship_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sponsorship" ADD CONSTRAINT "Sponsorship_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sponsorship" ADD CONSTRAINT "Sponsorship_publisher_fkey" FOREIGN KEY ("publisher") REFERENCES "Publisher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sponsorship" ADD CONSTRAINT "Sponsorship_sponsor_fkey" FOREIGN KEY ("sponsor") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;
