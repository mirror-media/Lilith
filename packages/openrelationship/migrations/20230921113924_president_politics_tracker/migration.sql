-- AlterTable
ALTER TABLE "Politic" ADD COLUMN     "expertPointSummary" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "factCheckSummary" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "positionChangeSummary" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "PoliticExpert" ALTER COLUMN "expert" DROP DEFAULT;

-- CreateTable
CREATE TABLE "FactcheckPartner" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "logo" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "FactcheckPartner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PoliticFactCheck" (
    "id" SERIAL NOT NULL,
    "politic" INTEGER,
    "checkDate" TIMESTAMP(3),
    "content" TEXT NOT NULL DEFAULT '',
    "checkResultType" TEXT DEFAULT 'correct',
    "link" TEXT NOT NULL DEFAULT '',
    "factcheckPartner" INTEGER,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "PoliticFactCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PoliticPositionChange" (
    "id" SERIAL NOT NULL,
    "politic" INTEGER,
    "factcheckPartner" INTEGER,
    "checkDate" TIMESTAMP(3),
    "content" TEXT NOT NULL DEFAULT '',
    "isChanged" BOOLEAN NOT NULL DEFAULT false,
    "link" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "PoliticPositionChange_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PoliticRepeat" (
    "id" SERIAL NOT NULL,
    "politic" INTEGER,
    "checkDate" TIMESTAMP(3),
    "content" TEXT NOT NULL DEFAULT '',
    "checkResultType" BOOLEAN NOT NULL DEFAULT false,
    "factcheckPartner" INTEGER,
    "link" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "PoliticRepeat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FactcheckPartner_createdBy_idx" ON "FactcheckPartner"("createdBy");

-- CreateIndex
CREATE INDEX "FactcheckPartner_updatedBy_idx" ON "FactcheckPartner"("updatedBy");

-- CreateIndex
CREATE INDEX "PoliticFactCheck_politic_idx" ON "PoliticFactCheck"("politic");

-- CreateIndex
CREATE INDEX "PoliticFactCheck_factcheckPartner_idx" ON "PoliticFactCheck"("factcheckPartner");

-- CreateIndex
CREATE INDEX "PoliticFactCheck_createdBy_idx" ON "PoliticFactCheck"("createdBy");

-- CreateIndex
CREATE INDEX "PoliticFactCheck_updatedBy_idx" ON "PoliticFactCheck"("updatedBy");

-- CreateIndex
CREATE INDEX "PoliticPositionChange_politic_idx" ON "PoliticPositionChange"("politic");

-- CreateIndex
CREATE INDEX "PoliticPositionChange_factcheckPartner_idx" ON "PoliticPositionChange"("factcheckPartner");

-- CreateIndex
CREATE INDEX "PoliticPositionChange_createdBy_idx" ON "PoliticPositionChange"("createdBy");

-- CreateIndex
CREATE INDEX "PoliticPositionChange_updatedBy_idx" ON "PoliticPositionChange"("updatedBy");

-- CreateIndex
CREATE INDEX "PoliticRepeat_politic_idx" ON "PoliticRepeat"("politic");

-- CreateIndex
CREATE INDEX "PoliticRepeat_factcheckPartner_idx" ON "PoliticRepeat"("factcheckPartner");

-- CreateIndex
CREATE INDEX "PoliticRepeat_createdBy_idx" ON "PoliticRepeat"("createdBy");

-- CreateIndex
CREATE INDEX "PoliticRepeat_updatedBy_idx" ON "PoliticRepeat"("updatedBy");

-- AddForeignKey
ALTER TABLE "FactcheckPartner" ADD CONSTRAINT "FactcheckPartner_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FactcheckPartner" ADD CONSTRAINT "FactcheckPartner_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoliticFactCheck" ADD CONSTRAINT "PoliticFactCheck_politic_fkey" FOREIGN KEY ("politic") REFERENCES "Politic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoliticFactCheck" ADD CONSTRAINT "PoliticFactCheck_factcheckPartner_fkey" FOREIGN KEY ("factcheckPartner") REFERENCES "FactcheckPartner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoliticFactCheck" ADD CONSTRAINT "PoliticFactCheck_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoliticFactCheck" ADD CONSTRAINT "PoliticFactCheck_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoliticPositionChange" ADD CONSTRAINT "PoliticPositionChange_politic_fkey" FOREIGN KEY ("politic") REFERENCES "Politic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoliticPositionChange" ADD CONSTRAINT "PoliticPositionChange_factcheckPartner_fkey" FOREIGN KEY ("factcheckPartner") REFERENCES "FactcheckPartner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoliticPositionChange" ADD CONSTRAINT "PoliticPositionChange_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoliticPositionChange" ADD CONSTRAINT "PoliticPositionChange_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoliticRepeat" ADD CONSTRAINT "PoliticRepeat_politic_fkey" FOREIGN KEY ("politic") REFERENCES "Politic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoliticRepeat" ADD CONSTRAINT "PoliticRepeat_factcheckPartner_fkey" FOREIGN KEY ("factcheckPartner") REFERENCES "FactcheckPartner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoliticRepeat" ADD CONSTRAINT "PoliticRepeat_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoliticRepeat" ADD CONSTRAINT "PoliticRepeat_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
