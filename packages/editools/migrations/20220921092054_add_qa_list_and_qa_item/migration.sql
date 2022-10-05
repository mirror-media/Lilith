-- CreateTable
CREATE TABLE "QAList" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "QAList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QAItem" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL DEFAULT E'',
    "content" JSONB,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "QAItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_QAList_items" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE INDEX "QAList_createdBy_idx" ON "QAList"("createdBy");

-- CreateIndex
CREATE INDEX "QAList_updatedBy_idx" ON "QAList"("updatedBy");

-- CreateIndex
CREATE INDEX "QAItem_createdBy_idx" ON "QAItem"("createdBy");

-- CreateIndex
CREATE INDEX "QAItem_updatedBy_idx" ON "QAItem"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "_QAList_items_AB_unique" ON "_QAList_items"("A", "B");

-- CreateIndex
CREATE INDEX "_QAList_items_B_index" ON "_QAList_items"("B");

-- AddForeignKey
ALTER TABLE "QAList" ADD CONSTRAINT "QAList_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QAList" ADD CONSTRAINT "QAList_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QAItem" ADD CONSTRAINT "QAItem_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QAItem" ADD CONSTRAINT "QAItem_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_QAList_items" ADD FOREIGN KEY ("A") REFERENCES "QAItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_QAList_items" ADD FOREIGN KEY ("B") REFERENCES "QAList"("id") ON DELETE CASCADE ON UPDATE CASCADE;
