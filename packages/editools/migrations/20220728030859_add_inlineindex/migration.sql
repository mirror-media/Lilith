-- CreateTable
CREATE TABLE "InlineIndex" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "style" TEXT NOT NULL DEFAULT E'',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "InlineIndex_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndexItem" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "url" TEXT NOT NULL DEFAULT E'',
    "imageFile_filesize" INTEGER,
    "imageFile_extension" TEXT,
    "imageFile_width" INTEGER,
    "imageFile_height" INTEGER,
    "imageFile_mode" TEXT,
    "imageFile_id" TEXT,
    "color" TEXT NOT NULL DEFAULT E'',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "IndexItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_IndexItem_index" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE INDEX "InlineIndex_createdBy_idx" ON "InlineIndex"("createdBy");

-- CreateIndex
CREATE INDEX "InlineIndex_updatedBy_idx" ON "InlineIndex"("updatedBy");

-- CreateIndex
CREATE INDEX "IndexItem_createdBy_idx" ON "IndexItem"("createdBy");

-- CreateIndex
CREATE INDEX "IndexItem_updatedBy_idx" ON "IndexItem"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "_IndexItem_index_AB_unique" ON "_IndexItem_index"("A", "B");

-- CreateIndex
CREATE INDEX "_IndexItem_index_B_index" ON "_IndexItem_index"("B");

-- AddForeignKey
ALTER TABLE "InlineIndex" ADD CONSTRAINT "InlineIndex_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InlineIndex" ADD CONSTRAINT "InlineIndex_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndexItem" ADD CONSTRAINT "IndexItem_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndexItem" ADD CONSTRAINT "IndexItem_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_IndexItem_index" ADD FOREIGN KEY ("A") REFERENCES "IndexItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_IndexItem_index" ADD FOREIGN KEY ("B") REFERENCES "InlineIndex"("id") ON DELETE CASCADE ON UPDATE CASCADE;
