-- AlterTable
ALTER TABLE "Hot" ADD COLUMN     "hotexternal" INTEGER;

-- CreateIndex
CREATE INDEX "Hot_hotexternal_idx" ON "Hot"("hotexternal");

-- AddForeignKey
ALTER TABLE "Hot" ADD CONSTRAINT "Hot_hotexternal_fkey" FOREIGN KEY ("hotexternal") REFERENCES "External"("id") ON DELETE SET NULL ON UPDATE CASCADE;
