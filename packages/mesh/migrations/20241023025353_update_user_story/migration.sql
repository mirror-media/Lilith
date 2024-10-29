-- AlterTable
ALTER TABLE "Story" ADD COLUMN     "storyType" TEXT DEFAULT E'article';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "publisher" INTEGER;

-- CreateIndex
CREATE INDEX "User_publisher_idx" ON "User"("publisher");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_publisher_fkey" FOREIGN KEY ("publisher") REFERENCES "Publisher"("id") ON DELETE SET NULL ON UPDATE CASCADE;
