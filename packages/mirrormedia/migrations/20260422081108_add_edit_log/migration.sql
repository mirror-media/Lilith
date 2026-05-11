-- CreateTable
CREATE TABLE "EditLog" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "operation" TEXT NOT NULL DEFAULT '',
    "postSlug" TEXT NOT NULL DEFAULT '',
    "changedList" TEXT NOT NULL DEFAULT '',
    "brief" JSONB,
    "content" JSONB,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "EditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EditLog_postSlug_idx" ON "EditLog"("postSlug");

-- CreateIndex
CREATE INDEX "EditLog_createdBy_idx" ON "EditLog"("createdBy");

-- CreateIndex
CREATE INDEX "EditLog_updatedBy_idx" ON "EditLog"("updatedBy");

-- AddForeignKey
ALTER TABLE "EditLog" ADD CONSTRAINT "EditLog_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditLog" ADD CONSTRAINT "EditLog_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
