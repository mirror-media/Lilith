-- AlterTable
ALTER TABLE "Video" ALTER COLUMN "fileDuration" TYPE TEXT USING "fileDuration"::text;
ALTER TABLE "Video" ALTER COLUMN "youtubeDuration" TYPE TEXT USING "youtubeDuration"::text;

