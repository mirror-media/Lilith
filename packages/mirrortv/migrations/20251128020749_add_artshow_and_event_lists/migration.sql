-- CreateTable
CREATE TABLE "ArtShow" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL DEFAULT '',
    "state" TEXT DEFAULT 'draft',
    "publishTime" TIMESTAMP(3),
    "heroImage" INTEGER,
    "content" JSONB,
    "show" INTEGER,
    "contentApiData" JSONB,
    "contentHtml" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "ArtShow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "state" TEXT DEFAULT 'draft',
    "publishTime" TIMESTAMP(3),
    "eventType" TEXT,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "image" INTEGER,
    "embedCode" TEXT NOT NULL DEFAULT '',
    "link" TEXT NOT NULL DEFAULT '',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_Event_categories" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_ArtShow_author" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_ArtShow_series" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ArtShow_slug_key" ON "ArtShow"("slug");

-- CreateIndex
CREATE INDEX "ArtShow_state_idx" ON "ArtShow"("state");

-- CreateIndex
CREATE INDEX "ArtShow_heroImage_idx" ON "ArtShow"("heroImage");

-- CreateIndex
CREATE INDEX "ArtShow_show_idx" ON "ArtShow"("show");

-- CreateIndex
CREATE INDEX "ArtShow_createdBy_idx" ON "ArtShow"("createdBy");

-- CreateIndex
CREATE INDEX "ArtShow_updatedBy_idx" ON "ArtShow"("updatedBy");

-- CreateIndex
CREATE INDEX "Event_state_idx" ON "Event"("state");

-- CreateIndex
CREATE INDEX "Event_publishTime_idx" ON "Event"("publishTime");

-- CreateIndex
CREATE INDEX "Event_eventType_idx" ON "Event"("eventType");

-- CreateIndex
CREATE INDEX "Event_image_idx" ON "Event"("image");

-- CreateIndex
CREATE INDEX "Event_createdBy_idx" ON "Event"("createdBy");

-- CreateIndex
CREATE INDEX "Event_updatedBy_idx" ON "Event"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "_Event_categories_AB_unique" ON "_Event_categories"("A", "B");

-- CreateIndex
CREATE INDEX "_Event_categories_B_index" ON "_Event_categories"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ArtShow_author_AB_unique" ON "_ArtShow_author"("A", "B");

-- CreateIndex
CREATE INDEX "_ArtShow_author_B_index" ON "_ArtShow_author"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ArtShow_series_AB_unique" ON "_ArtShow_series"("A", "B");

-- CreateIndex
CREATE INDEX "_ArtShow_series_B_index" ON "_ArtShow_series"("B");

-- AddForeignKey
ALTER TABLE "ArtShow" ADD CONSTRAINT "ArtShow_heroImage_fkey" FOREIGN KEY ("heroImage") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtShow" ADD CONSTRAINT "ArtShow_show_fkey" FOREIGN KEY ("show") REFERENCES "Show"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtShow" ADD CONSTRAINT "ArtShow_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtShow" ADD CONSTRAINT "ArtShow_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_image_fkey" FOREIGN KEY ("image") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Event_categories" ADD CONSTRAINT "_Event_categories_A_fkey" FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Event_categories" ADD CONSTRAINT "_Event_categories_B_fkey" FOREIGN KEY ("B") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArtShow_author" ADD CONSTRAINT "_ArtShow_author_A_fkey" FOREIGN KEY ("A") REFERENCES "ArtShow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArtShow_author" ADD CONSTRAINT "_ArtShow_author_B_fkey" FOREIGN KEY ("B") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArtShow_series" ADD CONSTRAINT "_ArtShow_series_A_fkey" FOREIGN KEY ("A") REFERENCES "ArtShow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArtShow_series" ADD CONSTRAINT "_ArtShow_series_B_fkey" FOREIGN KEY ("B") REFERENCES "Serie"("id") ON DELETE CASCADE ON UPDATE CASCADE;
