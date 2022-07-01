-- CreateTable
CREATE TABLE "EmbedCode" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "form" INTEGER,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "EmbedCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmbedCode_form_idx" ON "EmbedCode"("form");

-- CreateIndex
CREATE INDEX "EmbedCode_createdBy_idx" ON "EmbedCode"("createdBy");

-- CreateIndex
CREATE INDEX "EmbedCode_updatedBy_idx" ON "EmbedCode"("updatedBy");

-- AddForeignKey
ALTER TABLE "EmbedCode" ADD CONSTRAINT "EmbedCode_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmbedCode" ADD CONSTRAINT "EmbedCode_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmbedCode" ADD CONSTRAINT "EmbedCode_form_fkey" FOREIGN KEY ("form") REFERENCES "Form"("id") ON DELETE SET NULL ON UPDATE CASCADE;
