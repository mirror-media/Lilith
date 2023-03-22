-- AlterTable
ALTER TABLE "Author" ALTER COLUMN "title" DROP NOT NULL,
ALTER COLUMN "title" SET DEFAULT E'journalist',
ALTER COLUMN "title_en" DROP NOT NULL,
ALTER COLUMN "title_en" SET DEFAULT E'journalist';

-- AlterTable
ALTER TABLE "PageVariable" ADD COLUMN     "relatedImage" INTEGER,
ADD COLUMN     "url" TEXT NOT NULL DEFAULT E'';

-- CreateIndex
CREATE INDEX "PageVariable_relatedImage_idx" ON "PageVariable"("relatedImage");

-- AddForeignKey
ALTER TABLE "PageVariable" ADD CONSTRAINT "PageVariable_relatedImage_fkey" FOREIGN KEY ("relatedImage") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;
