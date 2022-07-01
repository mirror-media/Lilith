-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "ogImage" INTEGER;

-- CreateIndex
CREATE INDEX "Post_ogImage_idx" ON "Post"("ogImage");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_ogImage_fkey" FOREIGN KEY ("ogImage") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;
