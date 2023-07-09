-- AlterTable
ALTER TABLE "Liveblog" ADD COLUMN     "defaultMeasures" TEXT DEFAULT 'year',
ADD COLUMN     "maxMeasures" TEXT DEFAULT '年';

-- AlterTable
ALTER TABLE "LiveblogItem" ADD COLUMN     "displayDateString" TEXT DEFAULT 'day';
