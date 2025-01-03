-- CreateTable
CREATE TABLE "ReportReason" (
    "id" SERIAL NOT NULL,
    "reason" TEXT NOT NULL DEFAULT E'',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "ReportReason_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportRecord" (
    "id" SERIAL NOT NULL,
    "informant" INTEGER,
    "reason" INTEGER,
    "respondent" INTEGER,
    "comment" INTEGER,
    "collection" INTEGER,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "ReportRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReportReason_createdBy_idx" ON "ReportReason"("createdBy");

-- CreateIndex
CREATE INDEX "ReportReason_updatedBy_idx" ON "ReportReason"("updatedBy");

-- CreateIndex
CREATE INDEX "ReportRecord_informant_idx" ON "ReportRecord"("informant");

-- CreateIndex
CREATE INDEX "ReportRecord_reason_idx" ON "ReportRecord"("reason");

-- CreateIndex
CREATE INDEX "ReportRecord_respondent_idx" ON "ReportRecord"("respondent");

-- CreateIndex
CREATE INDEX "ReportRecord_comment_idx" ON "ReportRecord"("comment");

-- CreateIndex
CREATE INDEX "ReportRecord_collection_idx" ON "ReportRecord"("collection");

-- CreateIndex
CREATE INDEX "ReportRecord_createdBy_idx" ON "ReportRecord"("createdBy");

-- CreateIndex
CREATE INDEX "ReportRecord_updatedBy_idx" ON "ReportRecord"("updatedBy");

-- AddForeignKey
ALTER TABLE "ReportReason" ADD CONSTRAINT "ReportReason_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportReason" ADD CONSTRAINT "ReportReason_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportRecord" ADD CONSTRAINT "ReportRecord_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportRecord" ADD CONSTRAINT "ReportRecord_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportRecord" ADD CONSTRAINT "ReportRecord_comment_fkey" FOREIGN KEY ("comment") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportRecord" ADD CONSTRAINT "ReportRecord_collection_fkey" FOREIGN KEY ("collection") REFERENCES "Collection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportRecord" ADD CONSTRAINT "ReportRecord_informant_fkey" FOREIGN KEY ("informant") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportRecord" ADD CONSTRAINT "ReportRecord_respondent_fkey" FOREIGN KEY ("respondent") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportRecord" ADD CONSTRAINT "ReportRecord_reason_fkey" FOREIGN KEY ("reason") REFERENCES "ReportReason"("id") ON DELETE SET NULL ON UPDATE CASCADE;
