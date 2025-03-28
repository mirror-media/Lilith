-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "Warning" INTEGER;

-- CreateTable
CREATE TABLE "Warning" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Warning_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Warning_content_key" ON "Warning"("content");

-- CreateIndex
CREATE INDEX "Warning_createdBy_idx" ON "Warning"("createdBy");

-- CreateIndex
CREATE INDEX "Warning_updatedBy_idx" ON "Warning"("updatedBy");

-- CreateIndex
CREATE INDEX "Post_Warning_idx" ON "Post"("Warning");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_Warning_fkey" FOREIGN KEY ("Warning") REFERENCES "Warning"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Warning" ADD CONSTRAINT "Warning_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Warning" ADD CONSTRAINT "Warning_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
