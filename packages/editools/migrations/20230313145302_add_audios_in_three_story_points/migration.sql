-- AlterTable
ALTER TABLE "ThreeStoryPoint" ADD COLUMN     "audios" JSONB DEFAULT '[{"urls":[],"preload":"auto"}]',
ALTER COLUMN "cameraRig" SET DEFAULT '{"pois":[]}';
