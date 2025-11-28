-- CreateTable
CREATE TABLE "External" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL DEFAULT '',
    "partner" INTEGER,
    "name" TEXT NOT NULL DEFAULT 'untitled',
    "subtitle" TEXT NOT NULL DEFAULT '',
    "state" TEXT DEFAULT 'draft',
    "publishTime" TIMESTAMP(3),
    "byline" TEXT NOT NULL DEFAULT '',
    "thumbnail" TEXT NOT NULL DEFAULT '',
    "heroCaption" TEXT NOT NULL DEFAULT '',
    "brief_original" TEXT NOT NULL DEFAULT '',
    "content_original" TEXT NOT NULL DEFAULT '',
    "brief" TEXT NOT NULL DEFAULT '',
    "content" TEXT NOT NULL DEFAULT '',
    "source" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "External_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EditorChoice" (
    "id" SERIAL NOT NULL,
    "sortOrder" INTEGER,
    "choice" INTEGER,
    "externalChoice" INTEGER,
    "publishedDate" DATE,
    "expiredDate" DATE,
    "state" TEXT DEFAULT 'draft',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "EditorChoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_External_categories" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Section_artshow" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_External_tags" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "External_slug_key" ON "External"("slug");

-- CreateIndex
CREATE INDEX "External_partner_idx" ON "External"("partner");

-- CreateIndex
CREATE INDEX "External_state_idx" ON "External"("state");

-- CreateIndex
CREATE INDEX "External_createdBy_idx" ON "External"("createdBy");

-- CreateIndex
CREATE INDEX "External_updatedBy_idx" ON "External"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "EditorChoice_sortOrder_key" ON "EditorChoice"("sortOrder");

-- CreateIndex
CREATE INDEX "EditorChoice_choice_idx" ON "EditorChoice"("choice");

-- CreateIndex
CREATE INDEX "EditorChoice_externalChoice_idx" ON "EditorChoice"("externalChoice");

-- CreateIndex
CREATE INDEX "EditorChoice_state_idx" ON "EditorChoice"("state");

-- CreateIndex
CREATE INDEX "EditorChoice_createdBy_idx" ON "EditorChoice"("createdBy");

-- CreateIndex
CREATE INDEX "EditorChoice_updatedBy_idx" ON "EditorChoice"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "_External_categories_AB_unique" ON "_External_categories"("A", "B");

-- CreateIndex
CREATE INDEX "_External_categories_B_index" ON "_External_categories"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Section_artshow_AB_unique" ON "_Section_artshow"("A", "B");

-- CreateIndex
CREATE INDEX "_Section_artshow_B_index" ON "_Section_artshow"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_External_tags_AB_unique" ON "_External_tags"("A", "B");

-- CreateIndex
CREATE INDEX "_External_tags_B_index" ON "_External_tags"("B");

-- AddForeignKey
ALTER TABLE "External" ADD CONSTRAINT "External_partner_fkey" FOREIGN KEY ("partner") REFERENCES "Partner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "External" ADD CONSTRAINT "External_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "External" ADD CONSTRAINT "External_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditorChoice" ADD CONSTRAINT "EditorChoice_choice_fkey" FOREIGN KEY ("choice") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditorChoice" ADD CONSTRAINT "EditorChoice_externalChoice_fkey" FOREIGN KEY ("externalChoice") REFERENCES "External"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditorChoice" ADD CONSTRAINT "EditorChoice_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditorChoice" ADD CONSTRAINT "EditorChoice_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_External_categories" ADD CONSTRAINT "_External_categories_A_fkey" FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_External_categories" ADD CONSTRAINT "_External_categories_B_fkey" FOREIGN KEY ("B") REFERENCES "External"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Section_artshow" ADD CONSTRAINT "_Section_artshow_A_fkey" FOREIGN KEY ("A") REFERENCES "ArtShow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Section_artshow" ADD CONSTRAINT "_Section_artshow_B_fkey" FOREIGN KEY ("B") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_External_tags" ADD CONSTRAINT "_External_tags_A_fkey" FOREIGN KEY ("A") REFERENCES "External"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_External_tags" ADD CONSTRAINT "_External_tags_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
