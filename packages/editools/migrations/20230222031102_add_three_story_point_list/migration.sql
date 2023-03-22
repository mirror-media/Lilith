-- CreateTable
CREATE TABLE "ThreeStoryPoint" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "model_filesize" INTEGER,
    "model_mode" TEXT,
    "model_filename" TEXT,
    "captions" JSONB DEFAULT '[]',
    "cameraRig" JSONB DEFAULT '[]',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "ThreeStoryPoint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ThreeStoryPoint_createdBy_idx" ON "ThreeStoryPoint"("createdBy");

-- CreateIndex
CREATE INDEX "ThreeStoryPoint_updatedBy_idx" ON "ThreeStoryPoint"("updatedBy");

-- AddForeignKey
ALTER TABLE "ThreeStoryPoint" ADD CONSTRAINT "ThreeStoryPoint_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThreeStoryPoint" ADD CONSTRAINT "ThreeStoryPoint_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
