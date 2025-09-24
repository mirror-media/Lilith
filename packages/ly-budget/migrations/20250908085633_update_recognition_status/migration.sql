/*
  Warnings:

  - You are about to drop the column `freezeReduceAmountResult` on the `RecognitionStatus` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Proposal" ADD COLUMN     "reason" TEXT;

-- AlterTable
ALTER TABLE "RecognitionImage" ADD COLUMN     "result" TEXT;

-- AlterTable
ALTER TABLE "RecognitionStatus" DROP COLUMN "freezeReduceAmountResult",
ADD COLUMN     "freezeAmountResult" TEXT,
ADD COLUMN     "reductionAmountResult" TEXT;
