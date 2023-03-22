-- CreateTable
CREATE TABLE "VideoPicker" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "video1920_filesize" INTEGER,
    "video1920_mode" TEXT,
    "video1920_filename" TEXT,
    "video1440_filesize" INTEGER,
    "video1440_mode" TEXT,
    "video1440_filename" TEXT,
    "video1280_filesize" INTEGER,
    "video1280_mode" TEXT,
    "video1280_filename" TEXT,
    "video920_filesize" INTEGER,
    "video920_mode" TEXT,
    "video920_filename" TEXT,
    "video720_filesize" INTEGER,
    "video720_mode" TEXT,
    "video720_filename" TEXT,
    "muteHint" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "VideoPicker_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VideoPicker_createdBy_idx" ON "VideoPicker"("createdBy");

-- CreateIndex
CREATE INDEX "VideoPicker_updatedBy_idx" ON "VideoPicker"("updatedBy");

-- AddForeignKey
ALTER TABLE "VideoPicker" ADD CONSTRAINT "VideoPicker_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoPicker" ADD CONSTRAINT "VideoPicker_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
