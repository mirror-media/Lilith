-- AlterTable
ALTER TABLE "Collection" ADD COLUMN     "heroImage" INTEGER,
ADD COLUMN     "status" TEXT;

-- CreateTable
CREATE TABLE "Image" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "file_filesize" INTEGER,
    "file_mode" TEXT,
    "file_filename" TEXT,
    "urlOriginal" TEXT NOT NULL DEFAULT E'',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Image_createdBy_idx" ON "Image"("createdBy");

-- CreateIndex
CREATE INDEX "Image_updatedBy_idx" ON "Image"("updatedBy");

-- CreateIndex
CREATE INDEX "Collection_heroImage_idx" ON "Collection"("heroImage");

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_heroImage_fkey" FOREIGN KEY ("heroImage") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
