/*
  Warnings:

  - The `party` column on the `PersonElection` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Election" ALTER COLUMN "status" DROP NOT NULL,
ALTER COLUMN "status" DROP DEFAULT;

-- AlterTable
ALTER TABLE "PersonElection" DROP COLUMN "party",
ADD COLUMN     "party" INTEGER;

-- CreateTable
CREATE TABLE "ElectionArea" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "area_code" TEXT NOT NULL DEFAULT E'',
    "description" TEXT NOT NULL DEFAULT E'',
    "status" TEXT,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "ElectionArea_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ElectionArea_createdBy_idx" ON "ElectionArea"("createdBy");

-- CreateIndex
CREATE INDEX "ElectionArea_updatedBy_idx" ON "ElectionArea"("updatedBy");

-- CreateIndex
CREATE INDEX "PersonElection_party_idx" ON "PersonElection"("party");

-- AddForeignKey
ALTER TABLE "ElectionArea" ADD CONSTRAINT "ElectionArea_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ElectionArea" ADD CONSTRAINT "ElectionArea_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonElection" ADD CONSTRAINT "PersonElection_party_fkey" FOREIGN KEY ("party") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
