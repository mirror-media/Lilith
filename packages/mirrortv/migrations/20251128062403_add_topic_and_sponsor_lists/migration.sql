-- CreateTable
CREATE TABLE "Topic" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL DEFAULT '',
    "sortOrder" INTEGER,
    "name" TEXT NOT NULL DEFAULT '',
    "leading" TEXT DEFAULT 'image',
    "heroImage" INTEGER,
    "sortDir" TEXT DEFAULT 'desc',
    "state" TEXT DEFAULT 'draft',
    "brief" JSONB,
    "briefApiData" JSONB,
    "briefHtml" TEXT NOT NULL DEFAULT '',
    "facebook" TEXT NOT NULL DEFAULT '',
    "instagram" TEXT NOT NULL DEFAULT '',
    "line" TEXT NOT NULL DEFAULT '',
    "ogTitle" TEXT NOT NULL DEFAULT '',
    "ogDescription" TEXT NOT NULL DEFAULT '',
    "ogImage" INTEGER,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sponsor" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "sortOrder" INTEGER,
    "state" TEXT DEFAULT 'draft',
    "topic" INTEGER,
    "url" TEXT NOT NULL DEFAULT '',
    "logo" INTEGER,
    "mobile" INTEGER,
    "tablet" INTEGER,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Sponsor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_Topic_slideshow" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Topic_post" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Topic_tags" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Topic_categories" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Topic_slug_key" ON "Topic"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_sortOrder_key" ON "Topic"("sortOrder");

-- CreateIndex
CREATE INDEX "Topic_heroImage_idx" ON "Topic"("heroImage");

-- CreateIndex
CREATE INDEX "Topic_state_idx" ON "Topic"("state");

-- CreateIndex
CREATE INDEX "Topic_ogImage_idx" ON "Topic"("ogImage");

-- CreateIndex
CREATE INDEX "Topic_createdBy_idx" ON "Topic"("createdBy");

-- CreateIndex
CREATE INDEX "Topic_updatedBy_idx" ON "Topic"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "Sponsor_sortOrder_key" ON "Sponsor"("sortOrder");

-- CreateIndex
CREATE INDEX "Sponsor_topic_idx" ON "Sponsor"("topic");

-- CreateIndex
CREATE INDEX "Sponsor_logo_idx" ON "Sponsor"("logo");

-- CreateIndex
CREATE INDEX "Sponsor_mobile_idx" ON "Sponsor"("mobile");

-- CreateIndex
CREATE INDEX "Sponsor_tablet_idx" ON "Sponsor"("tablet");

-- CreateIndex
CREATE INDEX "Sponsor_createdBy_idx" ON "Sponsor"("createdBy");

-- CreateIndex
CREATE INDEX "Sponsor_updatedBy_idx" ON "Sponsor"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "_Topic_slideshow_AB_unique" ON "_Topic_slideshow"("A", "B");

-- CreateIndex
CREATE INDEX "_Topic_slideshow_B_index" ON "_Topic_slideshow"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Topic_post_AB_unique" ON "_Topic_post"("A", "B");

-- CreateIndex
CREATE INDEX "_Topic_post_B_index" ON "_Topic_post"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Topic_tags_AB_unique" ON "_Topic_tags"("A", "B");

-- CreateIndex
CREATE INDEX "_Topic_tags_B_index" ON "_Topic_tags"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Topic_categories_AB_unique" ON "_Topic_categories"("A", "B");

-- CreateIndex
CREATE INDEX "_Topic_categories_B_index" ON "_Topic_categories"("B");

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_heroImage_fkey" FOREIGN KEY ("heroImage") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_ogImage_fkey" FOREIGN KEY ("ogImage") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sponsor" ADD CONSTRAINT "Sponsor_topic_fkey" FOREIGN KEY ("topic") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sponsor" ADD CONSTRAINT "Sponsor_logo_fkey" FOREIGN KEY ("logo") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sponsor" ADD CONSTRAINT "Sponsor_mobile_fkey" FOREIGN KEY ("mobile") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sponsor" ADD CONSTRAINT "Sponsor_tablet_fkey" FOREIGN KEY ("tablet") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sponsor" ADD CONSTRAINT "Sponsor_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sponsor" ADD CONSTRAINT "Sponsor_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Topic_slideshow" ADD CONSTRAINT "_Topic_slideshow_A_fkey" FOREIGN KEY ("A") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Topic_slideshow" ADD CONSTRAINT "_Topic_slideshow_B_fkey" FOREIGN KEY ("B") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Topic_post" ADD CONSTRAINT "_Topic_post_A_fkey" FOREIGN KEY ("A") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Topic_post" ADD CONSTRAINT "_Topic_post_B_fkey" FOREIGN KEY ("B") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Topic_tags" ADD CONSTRAINT "_Topic_tags_A_fkey" FOREIGN KEY ("A") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Topic_tags" ADD CONSTRAINT "_Topic_tags_B_fkey" FOREIGN KEY ("B") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Topic_categories" ADD CONSTRAINT "_Topic_categories_A_fkey" FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Topic_categories" ADD CONSTRAINT "_Topic_categories_B_fkey" FOREIGN KEY ("B") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
