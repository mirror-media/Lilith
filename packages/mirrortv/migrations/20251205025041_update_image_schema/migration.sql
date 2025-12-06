-- AlterTable
ALTER TABLE "Image" ADD COLUMN     "topic" INTEGER;

-- CreateIndex
CREATE INDEX "Image_topic_idx" ON "Image"("topic");

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_topic_fkey" FOREIGN KEY ("topic") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;
