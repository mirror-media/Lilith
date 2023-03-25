-- CreateTable
CREATE TABLE "DualSlide" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "slides" JSONB DEFAULT '[{"content":[""],"imgSrc":""}]',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "DualSlide_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DualSlide_createdBy_idx" ON "DualSlide"("createdBy");

-- CreateIndex
CREATE INDEX "DualSlide_updatedBy_idx" ON "DualSlide"("updatedBy");

-- AddForeignKey
ALTER TABLE "DualSlide" ADD CONSTRAINT "DualSlide_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DualSlide" ADD CONSTRAINT "DualSlide_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
