-- AlterTable
ALTER TABLE "FactcheckPartner" ADD COLUMN     "sLogo" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "type" TEXT DEFAULT '合作媒體',
ADD COLUMN     "webUrl" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "year" TEXT DEFAULT '2023';
