-- AlterTable
ALTER TABLE "Election" ADD COLUMN     "organizationsElection" INTEGER;

-- AlterTable
ALTER TABLE "OrganizationsElection" ADD COLUMN     "elections" INTEGER;

-- AlterTable
ALTER TABLE "PoliticFactCheck" ADD COLUMN     "checkResultOther" TEXT NOT NULL DEFAULT '',
ALTER COLUMN "checkResultType" SET DEFAULT '1';

-- CreateIndex
CREATE INDEX "Election_organizationsElection_idx" ON "Election"("organizationsElection");

-- CreateIndex
CREATE INDEX "OrganizationsElection_elections_idx" ON "OrganizationsElection"("elections");

-- AddForeignKey
ALTER TABLE "Election" ADD CONSTRAINT "Election_organizationsElection_fkey" FOREIGN KEY ("organizationsElection") REFERENCES "OrganizationsElection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationsElection" ADD CONSTRAINT "OrganizationsElection_elections_fkey" FOREIGN KEY ("elections") REFERENCES "Election"("id") ON DELETE SET NULL ON UPDATE CASCADE;
