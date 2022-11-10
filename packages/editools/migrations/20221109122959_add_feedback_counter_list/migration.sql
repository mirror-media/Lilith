-- CreateTable
CREATE TABLE "FeedbackCounter" (
    "id" SERIAL NOT NULL,
    "form" INTEGER,
    "name" TEXT NOT NULL DEFAULT '',
    "uri" TEXT NOT NULL DEFAULT '',
    "theme" TEXT NOT NULL DEFAULT '',
    "shouldUseRecaptcha" BOOLEAN NOT NULL DEFAULT false,
    "thumbUpLabel" TEXT NOT NULL DEFAULT '',
    "thumbDownLabel" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "FeedbackCounter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FeedbackCounter_form_idx" ON "FeedbackCounter"("form");

-- CreateIndex
CREATE INDEX "FeedbackCounter_createdBy_idx" ON "FeedbackCounter"("createdBy");

-- CreateIndex
CREATE INDEX "FeedbackCounter_updatedBy_idx" ON "FeedbackCounter"("updatedBy");

-- AddForeignKey
ALTER TABLE "FeedbackCounter" ADD CONSTRAINT "FeedbackCounter_form_fkey" FOREIGN KEY ("form") REFERENCES "Form"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackCounter" ADD CONSTRAINT "FeedbackCounter_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackCounter" ADD CONSTRAINT "FeedbackCounter_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
