-- CreateTable
CREATE TABLE "Contact" (
    "id" SERIAL NOT NULL,
    "sortOrder" INTEGER,
    "slug" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "anchorImg" INTEGER,
    "showhostImg" INTEGER,
    "homepage" TEXT NOT NULL DEFAULT '',
    "facebook" TEXT NOT NULL DEFAULT '',
    "instagram" TEXT NOT NULL DEFAULT '',
    "twitter" TEXT NOT NULL DEFAULT '',
    "bio" JSONB,
    "anchorperson" BOOLEAN NOT NULL DEFAULT false,
    "host" BOOLEAN NOT NULL DEFAULT false,
    "international" BOOLEAN NOT NULL DEFAULT false,
    "bioApiData" TEXT NOT NULL DEFAULT '',
    "bioHtml" TEXT NOT NULL DEFAULT '',
    "isResigned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Contact_sortOrder_key" ON "Contact"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Contact_slug_key" ON "Contact"("slug");

-- CreateIndex
CREATE INDEX "Contact_anchorImg_idx" ON "Contact"("anchorImg");

-- CreateIndex
CREATE INDEX "Contact_showhostImg_idx" ON "Contact"("showhostImg");

-- CreateIndex
CREATE INDEX "Contact_createdBy_idx" ON "Contact"("createdBy");

-- CreateIndex
CREATE INDEX "Contact_updatedBy_idx" ON "Contact"("updatedBy");

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_anchorImg_fkey" FOREIGN KEY ("anchorImg") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_showhostImg_fkey" FOREIGN KEY ("showhostImg") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
