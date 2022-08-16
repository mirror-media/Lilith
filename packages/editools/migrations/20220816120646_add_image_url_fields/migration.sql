-- AlterTable
ALTER TABLE "Form" ADD COLUMN     "imageLink" TEXT NOT NULL DEFAULT E'',
ADD COLUMN     "mobilImageLink" TEXT NOT NULL DEFAULT E'';

-- AlterTable
ALTER TABLE "IndexItem" ADD COLUMN     "imageLink" TEXT NOT NULL DEFAULT E'';

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "imageLink" TEXT NOT NULL DEFAULT E'';
