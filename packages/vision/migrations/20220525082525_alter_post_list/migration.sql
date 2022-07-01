-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "headLogo" INTEGER,
ADD COLUMN     "heroMob" INTEGER,
ADD COLUMN     "heroStyle" TEXT DEFAULT E'normal',
ADD COLUMN     "subtitleColor" TEXT NOT NULL DEFAULT E'#000',
ADD COLUMN     "subtitleSize" INTEGER,
ADD COLUMN     "titleColor" TEXT NOT NULL DEFAULT E'#000',
ADD COLUMN     "titleSize" INTEGER;

-- CreateIndex
CREATE INDEX "Post_headLogo_idx" ON "Post"("headLogo");

-- CreateIndex
CREATE INDEX "Post_heroMob_idx" ON "Post"("heroMob");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_headLogo_fkey" FOREIGN KEY ("headLogo") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_heroMob_fkey" FOREIGN KEY ("heroMob") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;
