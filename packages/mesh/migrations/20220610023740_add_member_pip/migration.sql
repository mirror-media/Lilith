-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "avatar_image" INTEGER;

-- CreateIndex
CREATE INDEX "Member_avatar_image_idx" ON "Member"("avatar_image");

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_avatar_image_fkey" FOREIGN KEY ("avatar_image") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;
