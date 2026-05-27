-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "reviewNote" TEXT DEFAULT '',
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "reviewedBy" INTEGER;

-- CreateIndex
CREATE INDEX "Post_reviewedBy_idx" ON "Post"("reviewedBy");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
