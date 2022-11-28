/*
  Warnings:

  - You are about to drop the column `expert` on the `PoliticProgress` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PoliticProgress" DROP COLUMN "expert",
ALTER COLUMN "progress" DROP NOT NULL,
ALTER COLUMN "progress" SET DEFAULT E'active';

-- CreateTable
CREATE TABLE "PoliticTimeline" (
    "id" SERIAL NOT NULL,
    "politic" INTEGER,
    "eventDate" TIMESTAMP(3),
    "sortOrder" INTEGER,
    "content" TEXT NOT NULL DEFAULT E'',
    "link" TEXT NOT NULL DEFAULT E'',
    "contributer" TEXT NOT NULL DEFAULT E'',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "PoliticTimeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PoliticExpert" (
    "id" SERIAL NOT NULL,
    "politic" INTEGER,
    "avatar" TEXT NOT NULL DEFAULT E'',
    "title" TEXT NOT NULL DEFAULT E'',
    "reviewDate" TIMESTAMP(3),
    "content" TEXT NOT NULL DEFAULT E'',
    "link" TEXT NOT NULL DEFAULT E'',
    "contributer" TEXT NOT NULL DEFAULT E'',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "PoliticExpert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PoliticTimeline_politic_idx" ON "PoliticTimeline"("politic");

-- CreateIndex
CREATE INDEX "PoliticTimeline_createdBy_idx" ON "PoliticTimeline"("createdBy");

-- CreateIndex
CREATE INDEX "PoliticTimeline_updatedBy_idx" ON "PoliticTimeline"("updatedBy");

-- CreateIndex
CREATE INDEX "PoliticExpert_politic_idx" ON "PoliticExpert"("politic");

-- CreateIndex
CREATE INDEX "PoliticExpert_createdBy_idx" ON "PoliticExpert"("createdBy");

-- CreateIndex
CREATE INDEX "PoliticExpert_updatedBy_idx" ON "PoliticExpert"("updatedBy");

-- AddForeignKey
ALTER TABLE "PoliticTimeline" ADD CONSTRAINT "PoliticTimeline_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoliticTimeline" ADD CONSTRAINT "PoliticTimeline_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoliticTimeline" ADD CONSTRAINT "PoliticTimeline_politic_fkey" FOREIGN KEY ("politic") REFERENCES "Politic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoliticExpert" ADD CONSTRAINT "PoliticExpert_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoliticExpert" ADD CONSTRAINT "PoliticExpert_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoliticExpert" ADD CONSTRAINT "PoliticExpert_politic_fkey" FOREIGN KEY ("politic") REFERENCES "Politic"("id") ON DELETE SET NULL ON UPDATE CASCADE;
