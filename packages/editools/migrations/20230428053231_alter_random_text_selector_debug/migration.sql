-- AlterTable
ALTER TABLE "RandomTextSelector" ADD COLUMN     "isDebugMode" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "loadingIcon_extension" TEXT,
ADD COLUMN     "loadingIcon_filesize" INTEGER,
ADD COLUMN     "loadingIcon_height" INTEGER,
ADD COLUMN     "loadingIcon_id" TEXT,
ADD COLUMN     "loadingIcon_mode" TEXT,
ADD COLUMN     "loadingIcon_width" INTEGER;
