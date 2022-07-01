-- AlterTable
ALTER TABLE "Form" ADD COLUMN     "mobileImage" INTEGER;

-- AlterTable
ALTER TABLE "FormAnswer" ADD COLUMN     "mobileImage" INTEGER;

-- CreateIndex
CREATE INDEX "Form_mobileImage_idx" ON "Form"("mobileImage");

-- CreateIndex
CREATE INDEX "FormAnswer_mobileImage_idx" ON "FormAnswer"("mobileImage");

-- AddForeignKey
ALTER TABLE "Form" ADD CONSTRAINT "Form_mobileImage_fkey" FOREIGN KEY ("mobileImage") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormAnswer" ADD CONSTRAINT "FormAnswer_mobileImage_fkey" FOREIGN KEY ("mobileImage") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;
