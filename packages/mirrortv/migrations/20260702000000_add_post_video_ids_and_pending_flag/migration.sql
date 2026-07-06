-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "videoIds" JSONB,
ADD COLUMN     "isVideoObjectsPending" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Post_isVideoObjectsPending_idx" ON "Post"("isVideoObjectsPending");
