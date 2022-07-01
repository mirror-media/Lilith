-- AlterTable
ALTER TABLE "Image" ADD COLUMN     "imageFile_extension" TEXT,
ADD COLUMN     "imageFile_filesize" INTEGER,
ADD COLUMN     "imageFile_height" INTEGER,
ADD COLUMN     "imageFile_id" TEXT,
ADD COLUMN     "imageFile_mode" TEXT,
ADD COLUMN     "imageFile_width" INTEGER;
