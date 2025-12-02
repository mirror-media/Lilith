-- CreateTable
CREATE TABLE "Audio" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "file_filesize" INTEGER,
    "file_filename" TEXT,
    "coverPhoto" INTEGER,
    "meta" JSONB,
    "url" TEXT NOT NULL DEFAULT '',
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Audio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_Audio_tags" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE INDEX "Audio_coverPhoto_idx" ON "Audio"("coverPhoto");

-- CreateIndex
CREATE INDEX "Audio_createdBy_idx" ON "Audio"("createdBy");

-- CreateIndex
CREATE INDEX "Audio_updatedBy_idx" ON "Audio"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "_Audio_tags_AB_unique" ON "_Audio_tags"("A", "B");

-- CreateIndex
CREATE INDEX "_Audio_tags_B_index" ON "_Audio_tags"("B");

-- AddForeignKey
ALTER TABLE "Audio" ADD CONSTRAINT "Audio_coverPhoto_fkey" FOREIGN KEY ("coverPhoto") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Audio" ADD CONSTRAINT "Audio_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Audio" ADD CONSTRAINT "Audio_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Audio_tags" ADD CONSTRAINT "_Audio_tags_A_fkey" FOREIGN KEY ("A") REFERENCES "Audio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Audio_tags" ADD CONSTRAINT "_Audio_tags_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
