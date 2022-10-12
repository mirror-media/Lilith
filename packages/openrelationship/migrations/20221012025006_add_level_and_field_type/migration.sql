/*
  Warnings:

  - You are about to drop the column `children` on the `Event` table. All the data in the column will be lost.
  - The `electoral_district` column on the `PersonElection` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `elected` column on the `PersonElection` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `incumbent` column on the `PersonElection` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Election" ADD COLUMN     "level" TEXT DEFAULT E'local';

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "children",
ADD COLUMN     "sub" TEXT NOT NULL DEFAULT E'';

-- AlterTable
ALTER TABLE "PersonElection" DROP COLUMN "electoral_district",
ADD COLUMN     "electoral_district" INTEGER,
DROP COLUMN "elected",
ADD COLUMN     "elected" BOOLEAN NOT NULL DEFAULT false,
DROP COLUMN "incumbent",
ADD COLUMN     "incumbent" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "PersonElection_electoral_district_idx" ON "PersonElection"("electoral_district");

-- AddForeignKey
ALTER TABLE "PersonElection" ADD CONSTRAINT "PersonElection_electoral_district_fkey" FOREIGN KEY ("electoral_district") REFERENCES "ElectionArea"("id") ON DELETE SET NULL ON UPDATE CASCADE;
