-- AlterTable
ALTER TABLE "Specialfeature" ADD COLUMN     "category" INTEGER,
ADD COLUMN     "heroCreditUrl" TEXT NOT NULL DEFAULT E'',
ADD COLUMN     "region" TEXT,
ADD COLUMN     "section" INTEGER;

-- CreateIndex
CREATE INDEX "Specialfeature_section_idx" ON "Specialfeature"("section");

-- CreateIndex
CREATE INDEX "Specialfeature_category_idx" ON "Specialfeature"("category");

-- AddForeignKey
ALTER TABLE "Specialfeature" ADD CONSTRAINT "Specialfeature_category_fkey" FOREIGN KEY ("category") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Specialfeature" ADD CONSTRAINT "Specialfeature_section_fkey" FOREIGN KEY ("section") REFERENCES "Section"("id") ON DELETE SET NULL ON UPDATE CASCADE;
