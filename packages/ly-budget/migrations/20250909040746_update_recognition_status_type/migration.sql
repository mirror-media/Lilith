/*
  Warnings:

  - You are about to drop the `_RecognitionStatus_coSigners` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_RecognitionStatus_proposers` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `meetingRecordUrl` on table `Meeting` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "_RecognitionStatus_coSigners" DROP CONSTRAINT "_RecognitionStatus_coSigners_A_fkey";

-- DropForeignKey
ALTER TABLE "_RecognitionStatus_coSigners" DROP CONSTRAINT "_RecognitionStatus_coSigners_B_fkey";

-- DropForeignKey
ALTER TABLE "_RecognitionStatus_proposers" DROP CONSTRAINT "_RecognitionStatus_proposers_A_fkey";

-- DropForeignKey
ALTER TABLE "_RecognitionStatus_proposers" DROP CONSTRAINT "_RecognitionStatus_proposers_B_fkey";

-- AlterTable
ALTER TABLE "Meeting" ALTER COLUMN "location" DROP NOT NULL,
ALTER COLUMN "type" DROP NOT NULL,
ALTER COLUMN "meetingDate" DROP NOT NULL,
ALTER COLUMN "meetingRecordUrl" SET NOT NULL,
ALTER COLUMN "meetingRecordUrl" SET DEFAULT '';

-- AlterTable
ALTER TABLE "RecognitionStatus" ADD COLUMN     "coSigners" TEXT,
ADD COLUMN     "proposers" TEXT;

-- DropTable
DROP TABLE "_RecognitionStatus_coSigners";

-- DropTable
DROP TABLE "_RecognitionStatus_proposers";
