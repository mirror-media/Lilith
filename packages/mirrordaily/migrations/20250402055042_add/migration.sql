-- CreateTable
CREATE TABLE "PopularTag" (
    "id" SERIAL NOT NULL,
    "order" INTEGER,
    "choices" INTEGER,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "PopularTag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PopularTag_order_key" ON "PopularTag"("order");

-- CreateIndex
CREATE INDEX "PopularTag_choices_idx" ON "PopularTag"("choices");

-- CreateIndex
CREATE INDEX "PopularTag_createdBy_idx" ON "PopularTag"("createdBy");

-- CreateIndex
CREATE INDEX "PopularTag_updatedBy_idx" ON "PopularTag"("updatedBy");

-- AddForeignKey
ALTER TABLE "PopularTag" ADD CONSTRAINT "PopularTag_choices_fkey" FOREIGN KEY ("choices") REFERENCES "Tag"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PopularTag" ADD CONSTRAINT "PopularTag_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PopularTag" ADD CONSTRAINT "PopularTag_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
