-- AlterTable
ALTER TABLE "Image" ADD COLUMN     "defaultImage" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "defaultHeroImage" INTEGER;

-- CreateIndex
CREATE INDEX "Post_defaultHeroImage_idx" ON "Post"("defaultHeroImage");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_defaultHeroImage_fkey" FOREIGN KEY ("defaultHeroImage") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;
