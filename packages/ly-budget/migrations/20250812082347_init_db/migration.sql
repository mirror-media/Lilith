-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "isProtected" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Term" (
    "id" SERIAL NOT NULL,
    "termNumber" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "description" TEXT,

    CONSTRAINT "Term_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Committee" (
    "id" SERIAL NOT NULL,
    "term" INTEGER,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "session" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL DEFAULT '',
    "description" TEXT,

    CONSTRAINT "Committee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "People" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "term" INTEGER,
    "party" INTEGER,
    "description" TEXT,

    CONSTRAINT "People_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Government" (
    "id" SERIAL NOT NULL,
    "category" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL DEFAULT '',
    "description" TEXT,

    CONSTRAINT "Government_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Budget" (
    "id" SERIAL NOT NULL,
    "government" INTEGER,
    "type" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "majorCategory" TEXT NOT NULL DEFAULT '',
    "mediumCategory" TEXT NOT NULL DEFAULT '',
    "minorCategory" TEXT NOT NULL DEFAULT '',
    "projectName" TEXT,
    "projectDescription" TEXT,
    "budgetAmount" INTEGER NOT NULL,
    "lastYearSettlement" INTEGER,
    "budgetUrl" TEXT,
    "description" TEXT,

    CONSTRAINT "Budget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Meeting" (
    "id" SERIAL NOT NULL,
    "location" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "committee" INTEGER,
    "meetingDate" TIMESTAMP(3) NOT NULL,
    "meetingRecordUrl" TEXT,
    "description" TEXT,

    CONSTRAINT "Meeting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proposal" (
    "id" SERIAL NOT NULL,
    "government" INTEGER,
    "proposalTypes" TEXT NOT NULL,
    "result" TEXT,
    "reductionAmount" INTEGER,
    "freezeAmount" INTEGER,
    "budgetImageUrl" TEXT,
    "budget" INTEGER,
    "unfreezeStatus" TEXT,
    "description" TEXT,

    CONSTRAINT "Proposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecognitionImage" (
    "id" SERIAL NOT NULL,
    "meeting" INTEGER,
    "imageUrl" TEXT NOT NULL DEFAULT '',
    "description" TEXT,

    CONSTRAINT "RecognitionImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecognitionStatus" (
    "id" SERIAL NOT NULL,
    "image" INTEGER,
    "type" TEXT NOT NULL,
    "governmentBudgetResult" TEXT,
    "budgetCategoryResult" TEXT,
    "budgetAmountResult" TEXT,
    "budgetTypeResult" TEXT,
    "freezeReduceAmountResult" TEXT,
    "description" TEXT,

    CONSTRAINT "RecognitionStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_Committee_members" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_People_committees" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Proposal_proposers" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Proposal_coSigners" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Proposal_meetings" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Proposal_unfreezeHistory" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Proposal_mergedProposals" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Proposal_historicalProposals" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Committee_term_idx" ON "Committee"("term");

-- CreateIndex
CREATE INDEX "People_term_idx" ON "People"("term");

-- CreateIndex
CREATE INDEX "People_party_idx" ON "People"("party");

-- CreateIndex
CREATE INDEX "Budget_government_idx" ON "Budget"("government");

-- CreateIndex
CREATE INDEX "Meeting_committee_idx" ON "Meeting"("committee");

-- CreateIndex
CREATE INDEX "Proposal_government_idx" ON "Proposal"("government");

-- CreateIndex
CREATE INDEX "Proposal_budget_idx" ON "Proposal"("budget");

-- CreateIndex
CREATE INDEX "RecognitionImage_meeting_idx" ON "RecognitionImage"("meeting");

-- CreateIndex
CREATE INDEX "RecognitionStatus_image_idx" ON "RecognitionStatus"("image");

-- CreateIndex
CREATE UNIQUE INDEX "_Committee_members_AB_unique" ON "_Committee_members"("A", "B");

-- CreateIndex
CREATE INDEX "_Committee_members_B_index" ON "_Committee_members"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_People_committees_AB_unique" ON "_People_committees"("A", "B");

-- CreateIndex
CREATE INDEX "_People_committees_B_index" ON "_People_committees"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Proposal_proposers_AB_unique" ON "_Proposal_proposers"("A", "B");

-- CreateIndex
CREATE INDEX "_Proposal_proposers_B_index" ON "_Proposal_proposers"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Proposal_coSigners_AB_unique" ON "_Proposal_coSigners"("A", "B");

-- CreateIndex
CREATE INDEX "_Proposal_coSigners_B_index" ON "_Proposal_coSigners"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Proposal_meetings_AB_unique" ON "_Proposal_meetings"("A", "B");

-- CreateIndex
CREATE INDEX "_Proposal_meetings_B_index" ON "_Proposal_meetings"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Proposal_unfreezeHistory_AB_unique" ON "_Proposal_unfreezeHistory"("A", "B");

-- CreateIndex
CREATE INDEX "_Proposal_unfreezeHistory_B_index" ON "_Proposal_unfreezeHistory"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Proposal_mergedProposals_AB_unique" ON "_Proposal_mergedProposals"("A", "B");

-- CreateIndex
CREATE INDEX "_Proposal_mergedProposals_B_index" ON "_Proposal_mergedProposals"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Proposal_historicalProposals_AB_unique" ON "_Proposal_historicalProposals"("A", "B");

-- CreateIndex
CREATE INDEX "_Proposal_historicalProposals_B_index" ON "_Proposal_historicalProposals"("B");

-- AddForeignKey
ALTER TABLE "Committee" ADD CONSTRAINT "Committee_term_fkey" FOREIGN KEY ("term") REFERENCES "Term"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "People" ADD CONSTRAINT "People_term_fkey" FOREIGN KEY ("term") REFERENCES "Term"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "People" ADD CONSTRAINT "People_party_fkey" FOREIGN KEY ("party") REFERENCES "People"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_government_fkey" FOREIGN KEY ("government") REFERENCES "Government"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_committee_fkey" FOREIGN KEY ("committee") REFERENCES "Committee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_government_fkey" FOREIGN KEY ("government") REFERENCES "Government"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_budget_fkey" FOREIGN KEY ("budget") REFERENCES "Budget"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecognitionImage" ADD CONSTRAINT "RecognitionImage_meeting_fkey" FOREIGN KEY ("meeting") REFERENCES "Meeting"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecognitionStatus" ADD CONSTRAINT "RecognitionStatus_image_fkey" FOREIGN KEY ("image") REFERENCES "RecognitionImage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Committee_members" ADD CONSTRAINT "_Committee_members_A_fkey" FOREIGN KEY ("A") REFERENCES "Committee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Committee_members" ADD CONSTRAINT "_Committee_members_B_fkey" FOREIGN KEY ("B") REFERENCES "People"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_People_committees" ADD CONSTRAINT "_People_committees_A_fkey" FOREIGN KEY ("A") REFERENCES "Committee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_People_committees" ADD CONSTRAINT "_People_committees_B_fkey" FOREIGN KEY ("B") REFERENCES "People"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Proposal_proposers" ADD CONSTRAINT "_Proposal_proposers_A_fkey" FOREIGN KEY ("A") REFERENCES "People"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Proposal_proposers" ADD CONSTRAINT "_Proposal_proposers_B_fkey" FOREIGN KEY ("B") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Proposal_coSigners" ADD CONSTRAINT "_Proposal_coSigners_A_fkey" FOREIGN KEY ("A") REFERENCES "People"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Proposal_coSigners" ADD CONSTRAINT "_Proposal_coSigners_B_fkey" FOREIGN KEY ("B") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Proposal_meetings" ADD CONSTRAINT "_Proposal_meetings_A_fkey" FOREIGN KEY ("A") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Proposal_meetings" ADD CONSTRAINT "_Proposal_meetings_B_fkey" FOREIGN KEY ("B") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Proposal_unfreezeHistory" ADD CONSTRAINT "_Proposal_unfreezeHistory_A_fkey" FOREIGN KEY ("A") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Proposal_unfreezeHistory" ADD CONSTRAINT "_Proposal_unfreezeHistory_B_fkey" FOREIGN KEY ("B") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Proposal_mergedProposals" ADD CONSTRAINT "_Proposal_mergedProposals_A_fkey" FOREIGN KEY ("A") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Proposal_mergedProposals" ADD CONSTRAINT "_Proposal_mergedProposals_B_fkey" FOREIGN KEY ("B") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Proposal_historicalProposals" ADD CONSTRAINT "_Proposal_historicalProposals_A_fkey" FOREIGN KEY ("A") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Proposal_historicalProposals" ADD CONSTRAINT "_Proposal_historicalProposals_B_fkey" FOREIGN KEY ("B") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
