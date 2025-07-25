-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "relatedsOne" INTEGER,
ADD COLUMN     "relatedsTwo" INTEGER;

-- CreateIndex
CREATE INDEX "Post_relatedsOne_idx" ON "Post"("relatedsOne");

-- CreateIndex
CREATE INDEX "Post_relatedsTwo_idx" ON "Post"("relatedsTwo");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_relatedsOne_fkey" FOREIGN KEY ("relatedsOne") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_relatedsTwo_fkey" FOREIGN KEY ("relatedsTwo") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;
