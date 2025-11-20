-- CreateEnum
CREATE TYPE "SaleStateType" AS ENUM ('draft', 'published', 'scheduled', 'archived');

-- CreateEnum
CREATE TYPE "PostStateType" AS ENUM ('draft', 'published', 'scheduled', 'archived', 'invisible');

-- CreateTable
CREATE TABLE "Sale" (
    "id" SERIAL NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "adPost" INTEGER,
    "state" "SaleStateType" DEFAULT 'draft',
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Sale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL DEFAULT 'untitled',
    "subtitle" TEXT NOT NULL DEFAULT '',
    "state" "PostStateType" DEFAULT 'draft',
    "publishTime" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Sale_sortOrder_idx" ON "Sale"("sortOrder");

-- CreateIndex
CREATE INDEX "Sale_adPost_idx" ON "Sale"("adPost");

-- CreateIndex
CREATE INDEX "Sale_createdBy_idx" ON "Sale"("createdBy");

-- CreateIndex
CREATE INDEX "Sale_updatedBy_idx" ON "Sale"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");

-- CreateIndex
CREATE INDEX "Post_createdBy_idx" ON "Post"("createdBy");

-- CreateIndex
CREATE INDEX "Post_updatedBy_idx" ON "Post"("updatedBy");

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_adPost_fkey" FOREIGN KEY ("adPost") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
