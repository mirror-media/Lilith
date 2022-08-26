-- AlterTable
ALTER TABLE "Author" ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "email" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Category" ALTER COLUMN "state" DROP NOT NULL,
ALTER COLUMN "state" DROP DEFAULT,
ALTER COLUMN "state" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "ProjectNote" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL DEFAULT E'',
    "publishTime" TIMESTAMP(3),
    "content" JSONB,
    "apiData" JSONB,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "ProjectNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NoteCategory" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL DEFAULT E'',
    "title" TEXT NOT NULL DEFAULT E'',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "state" TEXT,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "NoteCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_Photo_tags" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Author_notes" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Post_note" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_NoteCategory_note" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE INDEX "ProjectNote_publishTime_idx" ON "ProjectNote"("publishTime");

-- CreateIndex
CREATE INDEX "ProjectNote_createdBy_idx" ON "ProjectNote"("createdBy");

-- CreateIndex
CREATE INDEX "ProjectNote_updatedBy_idx" ON "ProjectNote"("updatedBy");

-- CreateIndex
CREATE INDEX "NoteCategory_createdBy_idx" ON "NoteCategory"("createdBy");

-- CreateIndex
CREATE INDEX "NoteCategory_updatedBy_idx" ON "NoteCategory"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "_Photo_tags_AB_unique" ON "_Photo_tags"("A", "B");

-- CreateIndex
CREATE INDEX "_Photo_tags_B_index" ON "_Photo_tags"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Author_notes_AB_unique" ON "_Author_notes"("A", "B");

-- CreateIndex
CREATE INDEX "_Author_notes_B_index" ON "_Author_notes"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Post_note_AB_unique" ON "_Post_note"("A", "B");

-- CreateIndex
CREATE INDEX "_Post_note_B_index" ON "_Post_note"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_NoteCategory_note_AB_unique" ON "_NoteCategory_note"("A", "B");

-- CreateIndex
CREATE INDEX "_NoteCategory_note_B_index" ON "_NoteCategory_note"("B");

-- AddForeignKey
ALTER TABLE "ProjectNote" ADD CONSTRAINT "ProjectNote_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectNote" ADD CONSTRAINT "ProjectNote_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoteCategory" ADD CONSTRAINT "NoteCategory_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoteCategory" ADD CONSTRAINT "NoteCategory_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Photo_tags" ADD FOREIGN KEY ("A") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Photo_tags" ADD FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Author_notes" ADD FOREIGN KEY ("A") REFERENCES "Author"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Author_notes" ADD FOREIGN KEY ("B") REFERENCES "ProjectNote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_note" ADD FOREIGN KEY ("A") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_note" ADD FOREIGN KEY ("B") REFERENCES "ProjectNote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NoteCategory_note" ADD FOREIGN KEY ("A") REFERENCES "NoteCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NoteCategory_note" ADD FOREIGN KEY ("B") REFERENCES "ProjectNote"("id") ON DELETE CASCADE ON UPDATE CASCADE;
