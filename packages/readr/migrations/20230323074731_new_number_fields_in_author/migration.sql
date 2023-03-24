-- AlterTable
ALTER TABLE "Author" ADD COLUMN     "number_desc" TEXT NOT NULL DEFAULT E'',
ADD COLUMN     "number_desc_en" TEXT NOT NULL DEFAULT E'',
ADD COLUMN     "special_number" TEXT NOT NULL DEFAULT E'';
