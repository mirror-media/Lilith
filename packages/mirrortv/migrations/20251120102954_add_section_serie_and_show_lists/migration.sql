-- CreateTable
CREATE TABLE "Section" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL DEFAULT '',
    "introduction" TEXT NOT NULL DEFAULT '',
    "style" TEXT DEFAULT 'default',
    "trailerUrl" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Serie" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL DEFAULT '',
    "heroImage" INTEGER,
    "introduction" JSONB,
    "style" TEXT DEFAULT 'default',
    "introductionApiData" TEXT NOT NULL DEFAULT '',
    "introductionHtml" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Serie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Show" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL DEFAULT '',
    "isArtShow" BOOLEAN NOT NULL DEFAULT false,
    "bannerImg" INTEGER,
    "picture" INTEGER,
    "sortOrder" INTEGER,
    "introduction" TEXT NOT NULL DEFAULT '',
    "igUrl" TEXT NOT NULL DEFAULT '',
    "facebookUrl" TEXT NOT NULL DEFAULT '',
    "playList01" TEXT NOT NULL DEFAULT '',
    "playList02" TEXT NOT NULL DEFAULT '',
    "listShow" BOOLEAN NOT NULL DEFAULT false,
    "trailerPlaylist" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Show_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_Contact_relatedShows" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Contact_relatedSeries" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Section_host" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Show_staffName" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Section_show" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Section_series" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Section_slug_key" ON "Section"("slug");

-- CreateIndex
CREATE INDEX "Section_createdBy_idx" ON "Section"("createdBy");

-- CreateIndex
CREATE INDEX "Section_updatedBy_idx" ON "Section"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "Serie_slug_key" ON "Serie"("slug");

-- CreateIndex
CREATE INDEX "Serie_heroImage_idx" ON "Serie"("heroImage");

-- CreateIndex
CREATE INDEX "Serie_createdBy_idx" ON "Serie"("createdBy");

-- CreateIndex
CREATE INDEX "Serie_updatedBy_idx" ON "Serie"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "Show_slug_key" ON "Show"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Show_sortOrder_key" ON "Show"("sortOrder");

-- CreateIndex
CREATE INDEX "Show_bannerImg_idx" ON "Show"("bannerImg");

-- CreateIndex
CREATE INDEX "Show_picture_idx" ON "Show"("picture");

-- CreateIndex
CREATE INDEX "Show_createdBy_idx" ON "Show"("createdBy");

-- CreateIndex
CREATE INDEX "Show_updatedBy_idx" ON "Show"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "_Contact_relatedShows_AB_unique" ON "_Contact_relatedShows"("A", "B");

-- CreateIndex
CREATE INDEX "_Contact_relatedShows_B_index" ON "_Contact_relatedShows"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Contact_relatedSeries_AB_unique" ON "_Contact_relatedSeries"("A", "B");

-- CreateIndex
CREATE INDEX "_Contact_relatedSeries_B_index" ON "_Contact_relatedSeries"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Section_host_AB_unique" ON "_Section_host"("A", "B");

-- CreateIndex
CREATE INDEX "_Section_host_B_index" ON "_Section_host"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Show_staffName_AB_unique" ON "_Show_staffName"("A", "B");

-- CreateIndex
CREATE INDEX "_Show_staffName_B_index" ON "_Show_staffName"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Section_show_AB_unique" ON "_Section_show"("A", "B");

-- CreateIndex
CREATE INDEX "_Section_show_B_index" ON "_Section_show"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Section_series_AB_unique" ON "_Section_series"("A", "B");

-- CreateIndex
CREATE INDEX "_Section_series_B_index" ON "_Section_series"("B");

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Serie" ADD CONSTRAINT "Serie_heroImage_fkey" FOREIGN KEY ("heroImage") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Serie" ADD CONSTRAINT "Serie_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Serie" ADD CONSTRAINT "Serie_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Show" ADD CONSTRAINT "Show_bannerImg_fkey" FOREIGN KEY ("bannerImg") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Show" ADD CONSTRAINT "Show_picture_fkey" FOREIGN KEY ("picture") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Show" ADD CONSTRAINT "Show_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Show" ADD CONSTRAINT "Show_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Contact_relatedShows" ADD CONSTRAINT "_Contact_relatedShows_A_fkey" FOREIGN KEY ("A") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Contact_relatedShows" ADD CONSTRAINT "_Contact_relatedShows_B_fkey" FOREIGN KEY ("B") REFERENCES "Show"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Contact_relatedSeries" ADD CONSTRAINT "_Contact_relatedSeries_A_fkey" FOREIGN KEY ("A") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Contact_relatedSeries" ADD CONSTRAINT "_Contact_relatedSeries_B_fkey" FOREIGN KEY ("B") REFERENCES "Serie"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Section_host" ADD CONSTRAINT "_Section_host_A_fkey" FOREIGN KEY ("A") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Section_host" ADD CONSTRAINT "_Section_host_B_fkey" FOREIGN KEY ("B") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Show_staffName" ADD CONSTRAINT "_Show_staffName_A_fkey" FOREIGN KEY ("A") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Show_staffName" ADD CONSTRAINT "_Show_staffName_B_fkey" FOREIGN KEY ("B") REFERENCES "Show"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Section_show" ADD CONSTRAINT "_Section_show_A_fkey" FOREIGN KEY ("A") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Section_show" ADD CONSTRAINT "_Section_show_B_fkey" FOREIGN KEY ("B") REFERENCES "Show"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Section_series" ADD CONSTRAINT "_Section_series_A_fkey" FOREIGN KEY ("A") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Section_series" ADD CONSTRAINT "_Section_series_B_fkey" FOREIGN KEY ("B") REFERENCES "Serie"("id") ON DELETE CASCADE ON UPDATE CASCADE;
