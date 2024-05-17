-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "lockBy" INTEGER,
ADD COLUMN     "lockExpireAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Post_lockBy_idx" ON "Post"("lockBy");

-- CreateIndex
CREATE INDEX "Post_lockExpireAt_idx" ON "Post"("lockExpireAt");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_lockBy_fkey" FOREIGN KEY ("lockBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
