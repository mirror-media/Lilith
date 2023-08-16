-- CreateTable
CREATE TABLE "Header" (
    "id" SERIAL NOT NULL,
    "order" INTEGER,
    "section" INTEGER,
    "category" INTEGER,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Header_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Header_order_key" ON "Header"("order");

-- CreateIndex
CREATE INDEX "Header_section_idx" ON "Header"("section");

-- CreateIndex
CREATE INDEX "Header_category_idx" ON "Header"("category");

-- CreateIndex
CREATE INDEX "Header_createdBy_idx" ON "Header"("createdBy");

-- CreateIndex
CREATE INDEX "Header_updatedBy_idx" ON "Header"("updatedBy");

-- AddForeignKey
ALTER TABLE "Header" ADD CONSTRAINT "Header_section_fkey" FOREIGN KEY ("section") REFERENCES "Section"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Header" ADD CONSTRAINT "Header_category_fkey" FOREIGN KEY ("category") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Header" ADD CONSTRAINT "Header_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Header" ADD CONSTRAINT "Header_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
