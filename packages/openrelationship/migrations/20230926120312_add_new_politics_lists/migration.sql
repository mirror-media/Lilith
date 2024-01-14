/*
  Warnings:

  - You are about to drop the column `expertPointSummary` on the `Politic` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Election" ADD COLUMN     "addComments" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Politic" DROP COLUMN "expertPointSummary";

-- AlterTable
ALTER TABLE "PoliticExpert" ADD COLUMN     "expertPointSummary" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "PoliticResponse" (
    "id" SERIAL NOT NULL,
    "politic" INTEGER,
    "checkDate" TIMESTAMP(3),
    "responseName" TEXT NOT NULL DEFAULT '',
    "responsePic" TEXT NOT NULL DEFAULT '',
    "responseTitle" TEXT NOT NULL DEFAULT '',
    "content" TEXT NOT NULL DEFAULT '',
    "link" TEXT NOT NULL DEFAULT '',
    "contributer" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "PoliticResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PoliticControversie" (
    "id" SERIAL NOT NULL,
    "politic" INTEGER,
    "checkDate" TIMESTAMP(3),
    "controversiesSummary" TEXT NOT NULL DEFAULT '',
    "content" TEXT NOT NULL DEFAULT '',
    "factcheckPartner" INTEGER,
    "link" TEXT NOT NULL DEFAULT '',
    "contributer" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "PoliticControversie_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PoliticResponse_politic_idx" ON "PoliticResponse"("politic");

-- CreateIndex
CREATE INDEX "PoliticResponse_createdBy_idx" ON "PoliticResponse"("createdBy");

-- CreateIndex
CREATE INDEX "PoliticResponse_updatedBy_idx" ON "PoliticResponse"("updatedBy");

-- CreateIndex
CREATE INDEX "PoliticControversie_politic_idx" ON "PoliticControversie"("politic");

-- CreateIndex
CREATE INDEX "PoliticControversie_factcheckPartner_idx" ON "PoliticControversie"("factcheckPartner");

-- CreateIndex
CREATE INDEX "PoliticControversie_createdBy_idx" ON "PoliticControversie"("createdBy");

-- CreateIndex
CREATE INDEX "PoliticControversie_updatedBy_idx" ON "PoliticControversie"("updatedBy");

-- AddForeignKey
ALTER TABLE "PoliticResponse" ADD CONSTRAINT "PoliticResponse_politic_fkey" FOREIGN KEY ("politic") REFERENCES "Politic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoliticResponse" ADD CONSTRAINT "PoliticResponse_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoliticResponse" ADD CONSTRAINT "PoliticResponse_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoliticControversie" ADD CONSTRAINT "PoliticControversie_politic_fkey" FOREIGN KEY ("politic") REFERENCES "Politic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoliticControversie" ADD CONSTRAINT "PoliticControversie_factcheckPartner_fkey" FOREIGN KEY ("factcheckPartner") REFERENCES "FactcheckPartner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoliticControversie" ADD CONSTRAINT "PoliticControversie_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoliticControversie" ADD CONSTRAINT "PoliticControversie_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
