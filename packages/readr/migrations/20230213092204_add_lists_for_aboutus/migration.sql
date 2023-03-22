-- AlterTable
ALTER TABLE "Author" ADD COLUMN     "name_en" TEXT NOT NULL DEFAULT E'',
ADD COLUMN     "sort" INTEGER,
ADD COLUMN     "title" TEXT NOT NULL DEFAULT E'',
ADD COLUMN     "title_en" TEXT NOT NULL DEFAULT E'';

-- CreateTable
CREATE TABLE "PageVariable" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "value" JSONB,
    "page" TEXT DEFAULT E'about',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "PageVariable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Award" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "name_en" TEXT NOT NULL DEFAULT E'',
    "report" TEXT NOT NULL DEFAULT E'',
    "report_en" TEXT NOT NULL DEFAULT E'',
    "url" TEXT NOT NULL DEFAULT E'',
    "desc" TEXT NOT NULL DEFAULT E'',
    "desc_en" TEXT NOT NULL DEFAULT E'',
    "awardTime" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Award_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PageVariable_page_idx" ON "PageVariable"("page");

-- CreateIndex
CREATE INDEX "PageVariable_createdBy_idx" ON "PageVariable"("createdBy");

-- CreateIndex
CREATE INDEX "PageVariable_updatedBy_idx" ON "PageVariable"("updatedBy");

-- CreateIndex
CREATE INDEX "Award_awardTime_idx" ON "Award"("awardTime");

-- CreateIndex
CREATE INDEX "Award_createdBy_idx" ON "Award"("createdBy");

-- CreateIndex
CREATE INDEX "Award_updatedBy_idx" ON "Award"("updatedBy");

-- AddForeignKey
ALTER TABLE "PageVariable" ADD CONSTRAINT "PageVariable_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PageVariable" ADD CONSTRAINT "PageVariable_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Award" ADD CONSTRAINT "Award_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Award" ADD CONSTRAINT "Award_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
