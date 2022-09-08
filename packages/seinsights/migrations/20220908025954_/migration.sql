-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "storyType" TEXT;

-- AlterTable
ALTER TABLE "SpecialfeatureList" ADD COLUMN     "topSpecialfeature" INTEGER;

-- CreateIndex
CREATE INDEX "SpecialfeatureList_topSpecialfeature_idx" ON "SpecialfeatureList"("topSpecialfeature");

-- AddForeignKey
ALTER TABLE "SpecialfeatureList" ADD CONSTRAINT "SpecialfeatureList_topSpecialfeature_fkey" FOREIGN KEY ("topSpecialfeature") REFERENCES "Specialfeature"("id") ON DELETE SET NULL ON UPDATE CASCADE;
