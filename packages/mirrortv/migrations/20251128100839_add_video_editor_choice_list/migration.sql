-- CreateTable
CREATE TABLE "VideoEditorChoice" (
    "id" SERIAL NOT NULL,
    "order" DOUBLE PRECISION,
    "videoEditor" INTEGER,
    "state" TEXT DEFAULT 'draft',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "VideoEditorChoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VideoEditorChoice_videoEditor_idx" ON "VideoEditorChoice"("videoEditor");

-- CreateIndex
CREATE INDEX "VideoEditorChoice_state_idx" ON "VideoEditorChoice"("state");

-- CreateIndex
CREATE INDEX "VideoEditorChoice_createdBy_idx" ON "VideoEditorChoice"("createdBy");

-- CreateIndex
CREATE INDEX "VideoEditorChoice_updatedBy_idx" ON "VideoEditorChoice"("updatedBy");

-- AddForeignKey
ALTER TABLE "VideoEditorChoice" ADD CONSTRAINT "VideoEditorChoice_videoEditor_fkey" FOREIGN KEY ("videoEditor") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoEditorChoice" ADD CONSTRAINT "VideoEditorChoice_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoEditorChoice" ADD CONSTRAINT "VideoEditorChoice_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
