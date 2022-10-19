-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "reviewed" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Person" ADD COLUMN     "reviewed" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Politic" ADD COLUMN     "reviewed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tag" INTEGER;

-- CreateIndex
CREATE INDEX "Politic_tag_idx" ON "Politic"("tag");

-- AddForeignKey
ALTER TABLE "Politic" ADD CONSTRAINT "Politic_tag_fkey" FOREIGN KEY ("tag") REFERENCES "Tag"("id") ON DELETE SET NULL ON UPDATE CASCADE;
