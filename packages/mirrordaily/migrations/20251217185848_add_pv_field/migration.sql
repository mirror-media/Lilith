-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "pv" INTEGER DEFAULT 0;

-- CreateIndex
CREATE INDEX "Post_pv_idx" ON "Post"("pv");
