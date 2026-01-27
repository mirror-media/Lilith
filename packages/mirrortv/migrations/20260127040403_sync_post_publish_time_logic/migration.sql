-- AlterTable
ALTER TABLE "Post" ALTER COLUMN "publishTime" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "updateTimeStamp" SET DEFAULT true;

-- CreateIndex
CREATE INDEX "Post_publishTime_idx" ON "Post"("publishTime");
