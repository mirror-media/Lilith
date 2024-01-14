-- AlterTable
ALTER TABLE "Politic" ADD COLUMN     "organization" INTEGER;

-- CreateTable
CREATE TABLE "_OrganizationsElection_politics" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_OrganizationsElection_politics_AB_unique" ON "_OrganizationsElection_politics"("A", "B");

-- CreateIndex
CREATE INDEX "_OrganizationsElection_politics_B_index" ON "_OrganizationsElection_politics"("B");

-- CreateIndex
CREATE INDEX "Politic_organization_idx" ON "Politic"("organization");

-- AddForeignKey
ALTER TABLE "Politic" ADD CONSTRAINT "Politic_organization_fkey" FOREIGN KEY ("organization") REFERENCES "OrganizationsElection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrganizationsElection_politics" ADD CONSTRAINT "_OrganizationsElection_politics_A_fkey" FOREIGN KEY ("A") REFERENCES "OrganizationsElection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrganizationsElection_politics" ADD CONSTRAINT "_OrganizationsElection_politics_B_fkey" FOREIGN KEY ("B") REFERENCES "Politic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
