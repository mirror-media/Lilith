-- AlterTable
ALTER TABLE
  "public"."Proposal" ALTER COLUMN "year"
DROP
  NOT NULL;

ALTER TABLE "Party" ALTER COLUMN "color" SET DEFAULT '';

-- CreateTable
CREATE TABLE "BudgetYear" (
    "id" SERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "budgetProgress" TEXT NOT NULL,
    "dataProgress" TEXT NOT NULL DEFAULT 'in-progress',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "BudgetYear_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BudgetYear_year_key" ON "BudgetYear"("year");

-- CreateIndex
CREATE INDEX "BudgetYear_createdBy_idx" ON "BudgetYear"("createdBy");

-- CreateIndex
CREATE INDEX "BudgetYear_updatedBy_idx" ON "BudgetYear"("updatedBy");

-- CreateIndex
CREATE INDEX "Proposal_year_idx" ON "Proposal"("year");

-- AddForeignKey
ALTER TABLE "BudgetYear" ADD CONSTRAINT "BudgetYear_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetYear" ADD CONSTRAINT "BudgetYear_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_year_fkey" FOREIGN KEY ("year") REFERENCES "BudgetYear"("id") ON DELETE SET NULL ON UPDATE CASCADE;
