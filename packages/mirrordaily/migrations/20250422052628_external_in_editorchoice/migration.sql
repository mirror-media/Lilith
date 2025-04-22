-- AlterTable
ALTER TABLE "EditorChoice" ADD COLUMN     "choiceexternal" INTEGER;

-- CreateIndex
CREATE INDEX "EditorChoice_choiceexternal_idx" ON "EditorChoice"("choiceexternal");

-- AddForeignKey
ALTER TABLE "EditorChoice" ADD CONSTRAINT "EditorChoice_choiceexternal_fkey" FOREIGN KEY ("choiceexternal") REFERENCES "External"("id") ON DELETE SET NULL ON UPDATE CASCADE;
