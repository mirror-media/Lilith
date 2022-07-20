-- CreateTable
CREATE TABLE "Karaoke" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "quote" TEXT NOT NULL DEFAULT E'',
    "audio_filesize" INTEGER,
    "audio_mode" TEXT,
    "audio_filename" TEXT,
    "imageFile_filesize" INTEGER,
    "imageFile_extension" TEXT,
    "imageFile_width" INTEGER,
    "imageFile_height" INTEGER,
    "imageFile_mode" TEXT,
    "imageFile_id" TEXT,
    "muteHint" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Karaoke_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Karaoke_createdBy_idx" ON "Karaoke"("createdBy");

-- CreateIndex
CREATE INDEX "Karaoke_updatedBy_idx" ON "Karaoke"("updatedBy");

-- AddForeignKey
ALTER TABLE "Karaoke" ADD CONSTRAINT "Karaoke_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Karaoke" ADD CONSTRAINT "Karaoke_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
