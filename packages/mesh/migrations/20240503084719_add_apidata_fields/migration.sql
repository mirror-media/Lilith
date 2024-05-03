-- AlterTable
ALTER TABLE "Publisher" ADD COLUMN     "apidata_endpoint" TEXT NOT NULL DEFAULT E'',
ADD COLUMN     "need_apidata" BOOLEAN NOT NULL DEFAULT false;
