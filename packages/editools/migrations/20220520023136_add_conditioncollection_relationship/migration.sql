-- AlterTable
ALTER TABLE "ConditionCollection" ADD COLUMN     "form" INTEGER;

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "subject" INTEGER;

-- CreateIndex
CREATE INDEX "ConditionCollection_form_idx" ON "ConditionCollection"("form");

-- CreateIndex
CREATE INDEX "Question_subject_idx" ON "Question"("subject");

-- AddForeignKey
ALTER TABLE "ConditionCollection" ADD CONSTRAINT "ConditionCollection_form_fkey" FOREIGN KEY ("form") REFERENCES "Form"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_subject_fkey" FOREIGN KEY ("subject") REFERENCES "Tag"("id") ON DELETE SET NULL ON UPDATE CASCADE;
