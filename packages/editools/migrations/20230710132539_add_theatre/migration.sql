-- CreateTable
CREATE TABLE "Theatre" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "objectJson" JSONB,
    "animationJson" JSONB,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Theatre_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Theatre_createdBy_idx" ON "Theatre"("createdBy");

-- CreateIndex
CREATE INDEX "Theatre_updatedBy_idx" ON "Theatre"("updatedBy");

-- AddForeignKey
ALTER TABLE "Theatre" ADD CONSTRAINT "Theatre_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Theatre" ADD CONSTRAINT "Theatre_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
