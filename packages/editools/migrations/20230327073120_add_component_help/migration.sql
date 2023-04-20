-- AlterTable
ALTER TABLE "DualSlide" ADD COLUMN     "helper" INTEGER;

-- AlterTable
ALTER TABLE "Karaoke" ADD COLUMN     "helper" INTEGER;

-- CreateTable
CREATE TABLE "ComponentHelp" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "desc" TEXT NOT NULL DEFAULT E'',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "ComponentHelp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ComponentHelp_createdBy_idx" ON "ComponentHelp"("createdBy");

-- CreateIndex
CREATE INDEX "ComponentHelp_updatedBy_idx" ON "ComponentHelp"("updatedBy");

-- CreateIndex
CREATE INDEX "DualSlide_helper_idx" ON "DualSlide"("helper");

-- CreateIndex
CREATE INDEX "Karaoke_helper_idx" ON "Karaoke"("helper");

-- AddForeignKey
ALTER TABLE "Karaoke" ADD CONSTRAINT "Karaoke_helper_fkey" FOREIGN KEY ("helper") REFERENCES "ComponentHelp"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DualSlide" ADD CONSTRAINT "DualSlide_helper_fkey" FOREIGN KEY ("helper") REFERENCES "ComponentHelp"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComponentHelp" ADD CONSTRAINT "ComponentHelp_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComponentHelp" ADD CONSTRAINT "ComponentHelp_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
