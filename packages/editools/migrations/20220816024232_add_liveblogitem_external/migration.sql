-- AlterTable
ALTER TABLE "Liveblog" ADD COLUMN     "css" TEXT NOT NULL DEFAULT E'';

-- AlterTable
ALTER TABLE "LiveblogItem" ADD COLUMN     "external" TEXT NOT NULL DEFAULT E'',
ADD COLUMN     "type" TEXT DEFAULT E'article';
