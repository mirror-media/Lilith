/*
  Warnings:

  - You are about to drop the column `hotspotJson` on the `FullScene` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "FullScene" DROP COLUMN "hotspotJson",
ADD COLUMN     "fullSceneConfig" JSONB DEFAULT '{"hotspots":[],"pitch":0,"yaw":0,"showControls":true}';
