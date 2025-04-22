-- AlterTable
ALTER TABLE "External" ADD COLUMN     "manualOrderOfCategories" JSONB,
ADD COLUMN     "manualOrderOfSections" JSONB,
ADD COLUMN     "topics" INTEGER;

-- CreateTable
CREATE TABLE "Hot" (
    "id" SERIAL NOT NULL,
    "order" INTEGER,
    "outlink" TEXT NOT NULL DEFAULT '',
    "hotnews" INTEGER,
    "state" TEXT DEFAULT 'draft',
    "heroImage" INTEGER,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Hot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_Category_externals" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_External_sections" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Hot_order_key" ON "Hot"("order");

-- CreateIndex
CREATE INDEX "Hot_hotnews_idx" ON "Hot"("hotnews");

-- CreateIndex
CREATE INDEX "Hot_state_idx" ON "Hot"("state");

-- CreateIndex
CREATE INDEX "Hot_heroImage_idx" ON "Hot"("heroImage");

-- CreateIndex
CREATE INDEX "Hot_createdBy_idx" ON "Hot"("createdBy");

-- CreateIndex
CREATE INDEX "Hot_updatedBy_idx" ON "Hot"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "_Category_externals_AB_unique" ON "_Category_externals"("A", "B");

-- CreateIndex
CREATE INDEX "_Category_externals_B_index" ON "_Category_externals"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_External_sections_AB_unique" ON "_External_sections"("A", "B");

-- CreateIndex
CREATE INDEX "_External_sections_B_index" ON "_External_sections"("B");

-- CreateIndex
CREATE INDEX "External_topics_idx" ON "External"("topics");

-- AddForeignKey
ALTER TABLE "External" ADD CONSTRAINT "External_topics_fkey" FOREIGN KEY ("topics") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hot" ADD CONSTRAINT "Hot_hotnews_fkey" FOREIGN KEY ("hotnews") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hot" ADD CONSTRAINT "Hot_heroImage_fkey" FOREIGN KEY ("heroImage") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hot" ADD CONSTRAINT "Hot_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hot" ADD CONSTRAINT "Hot_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Category_externals" ADD CONSTRAINT "_Category_externals_A_fkey" FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Category_externals" ADD CONSTRAINT "_Category_externals_B_fkey" FOREIGN KEY ("B") REFERENCES "External"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_External_sections" ADD CONSTRAINT "_External_sections_A_fkey" FOREIGN KEY ("A") REFERENCES "External"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_External_sections" ADD CONSTRAINT "_External_sections_B_fkey" FOREIGN KEY ("B") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;
