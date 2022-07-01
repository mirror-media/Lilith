-- AlterTable
ALTER TABLE "Author" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "listing" BOOLEAN NOT NULL DEFAULT false;
