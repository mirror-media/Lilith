-- AlterTable
ALTER TABLE "Election" ADD COLUMN     "tags" INTEGER;

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "tags" INTEGER;

-- AlterTable
ALTER TABLE "Person" ADD COLUMN     "tags" INTEGER;

-- AlterTable
ALTER TABLE "Politic" ADD COLUMN     "politicCategory" INTEGER;

-- CreateTable
CREATE TABLE "PoliticCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "brief" TEXT NOT NULL DEFAULT '',
    "state" TEXT DEFAULT 'active',
    "ogTitle" TEXT NOT NULL DEFAULT '',
    "ogDescription" TEXT NOT NULL DEFAULT '',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "PoliticCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PoliticCategory_name_key" ON "PoliticCategory"("name");

-- CreateIndex
CREATE INDEX "PoliticCategory_createdBy_idx" ON "PoliticCategory"("createdBy");

-- CreateIndex
CREATE INDEX "PoliticCategory_updatedBy_idx" ON "PoliticCategory"("updatedBy");

-- CreateIndex
CREATE INDEX "Election_tags_idx" ON "Election"("tags");

-- CreateIndex
CREATE INDEX "Organization_tags_idx" ON "Organization"("tags");

-- CreateIndex
CREATE INDEX "Person_tags_idx" ON "Person"("tags");

-- CreateIndex
CREATE INDEX "Politic_politicCategory_idx" ON "Politic"("politicCategory");

-- AddForeignKey
ALTER TABLE "Election" ADD CONSTRAINT "Election_tags_fkey" FOREIGN KEY ("tags") REFERENCES "Tag"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Person" ADD CONSTRAINT "Person_tags_fkey" FOREIGN KEY ("tags") REFERENCES "Tag"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_tags_fkey" FOREIGN KEY ("tags") REFERENCES "Tag"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Politic" ADD CONSTRAINT "Politic_politicCategory_fkey" FOREIGN KEY ("politicCategory") REFERENCES "PoliticCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoliticCategory" ADD CONSTRAINT "PoliticCategory_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoliticCategory" ADD CONSTRAINT "PoliticCategory_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
