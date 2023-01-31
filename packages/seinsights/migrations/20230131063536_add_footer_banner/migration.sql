-- CreateTable
CREATE TABLE "FooterBanner" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "order" INTEGER,
    "bannerImage" INTEGER,
    "mobileImage" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "publishDate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "url" TEXT NOT NULL DEFAULT E'',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "FooterBanner_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FooterBanner_order_key" ON "FooterBanner"("order");

-- CreateIndex
CREATE INDEX "FooterBanner_bannerImage_idx" ON "FooterBanner"("bannerImage");

-- CreateIndex
CREATE INDEX "FooterBanner_mobileImage_idx" ON "FooterBanner"("mobileImage");

-- CreateIndex
CREATE INDEX "FooterBanner_createdBy_idx" ON "FooterBanner"("createdBy");

-- CreateIndex
CREATE INDEX "FooterBanner_updatedBy_idx" ON "FooterBanner"("updatedBy");

-- AddForeignKey
ALTER TABLE "FooterBanner" ADD CONSTRAINT "FooterBanner_bannerImage_fkey" FOREIGN KEY ("bannerImage") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FooterBanner" ADD CONSTRAINT "FooterBanner_mobileImage_fkey" FOREIGN KEY ("mobileImage") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FooterBanner" ADD CONSTRAINT "FooterBanner_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FooterBanner" ADD CONSTRAINT "FooterBanner_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
