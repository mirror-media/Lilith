/*
  Warnings:

  - The `hint` column on the `Liveblog` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Liveblog" DROP COLUMN "hint",
ADD COLUMN     "hint" JSONB DEFAULT '{"dividerConfig":{"rwd":{"mobile":{"year":5,"month":6,"day":7},"pc":{"year":5,"month":6,"day":7}},"bubbleLevelSizesInDivider":{"5":[23,36,48,60,76],"6":[23,36,48,60,66],"7":[23,28,36,48,60]}},"headerHeightConfig":{"rwd":{"mobile":66,"pc":80},"rwdBreakpoints":[{"minWidth":0,"name":"mobile"},{"minWidth":568,"name":"pc"}]},"noEventContent":"<span style=\"text-align: center; font-size: 14px; line-height: 1.5; color: #989898;\">點擊泡泡<br />或往下滑動</span>"}';
