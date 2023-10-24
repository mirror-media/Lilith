-- CreateTable
CREATE TABLE "EditingPolitic" (
    "id" SERIAL NOT NULL,
    "person" INTEGER,
    "organization" INTEGER,
    "thread_parent" INTEGER,
    "changeLog" TEXT NOT NULL DEFAULT '',
    "desc" TEXT NOT NULL DEFAULT '',
    "content" TEXT NOT NULL DEFAULT '',
    "current_progress" TEXT DEFAULT 'no-progress',
    "source" TEXT NOT NULL DEFAULT '',
    "contributer" TEXT NOT NULL DEFAULT '',
    "status" TEXT DEFAULT 'notverified',
    "tag" INTEGER,
    "politicCategory" INTEGER,
    "checked" BOOLEAN NOT NULL DEFAULT false,
    "reviewed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "EditingPolitic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_EditingPolitic_positionChange" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_EditingPolitic_factCheck" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_EditingPolitic_expertPoint" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_EditingPolitic_repeat" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_EditingPolitic_controversies" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_EditingPolitic_response" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_EditingPolitic_timeline" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE INDEX "EditingPolitic_person_idx" ON "EditingPolitic"("person");

-- CreateIndex
CREATE INDEX "EditingPolitic_organization_idx" ON "EditingPolitic"("organization");

-- CreateIndex
CREATE INDEX "EditingPolitic_thread_parent_idx" ON "EditingPolitic"("thread_parent");

-- CreateIndex
CREATE INDEX "EditingPolitic_current_progress_idx" ON "EditingPolitic"("current_progress");

-- CreateIndex
CREATE INDEX "EditingPolitic_status_idx" ON "EditingPolitic"("status");

-- CreateIndex
CREATE INDEX "EditingPolitic_tag_idx" ON "EditingPolitic"("tag");

-- CreateIndex
CREATE INDEX "EditingPolitic_politicCategory_idx" ON "EditingPolitic"("politicCategory");

-- CreateIndex
CREATE INDEX "EditingPolitic_createdBy_idx" ON "EditingPolitic"("createdBy");

-- CreateIndex
CREATE INDEX "EditingPolitic_updatedBy_idx" ON "EditingPolitic"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "_EditingPolitic_positionChange_AB_unique" ON "_EditingPolitic_positionChange"("A", "B");

-- CreateIndex
CREATE INDEX "_EditingPolitic_positionChange_B_index" ON "_EditingPolitic_positionChange"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_EditingPolitic_factCheck_AB_unique" ON "_EditingPolitic_factCheck"("A", "B");

-- CreateIndex
CREATE INDEX "_EditingPolitic_factCheck_B_index" ON "_EditingPolitic_factCheck"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_EditingPolitic_expertPoint_AB_unique" ON "_EditingPolitic_expertPoint"("A", "B");

-- CreateIndex
CREATE INDEX "_EditingPolitic_expertPoint_B_index" ON "_EditingPolitic_expertPoint"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_EditingPolitic_repeat_AB_unique" ON "_EditingPolitic_repeat"("A", "B");

-- CreateIndex
CREATE INDEX "_EditingPolitic_repeat_B_index" ON "_EditingPolitic_repeat"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_EditingPolitic_controversies_AB_unique" ON "_EditingPolitic_controversies"("A", "B");

-- CreateIndex
CREATE INDEX "_EditingPolitic_controversies_B_index" ON "_EditingPolitic_controversies"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_EditingPolitic_response_AB_unique" ON "_EditingPolitic_response"("A", "B");

-- CreateIndex
CREATE INDEX "_EditingPolitic_response_B_index" ON "_EditingPolitic_response"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_EditingPolitic_timeline_AB_unique" ON "_EditingPolitic_timeline"("A", "B");

-- CreateIndex
CREATE INDEX "_EditingPolitic_timeline_B_index" ON "_EditingPolitic_timeline"("B");

-- AddForeignKey
ALTER TABLE "EditingPolitic" ADD CONSTRAINT "EditingPolitic_person_fkey" FOREIGN KEY ("person") REFERENCES "PersonElection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditingPolitic" ADD CONSTRAINT "EditingPolitic_organization_fkey" FOREIGN KEY ("organization") REFERENCES "OrganizationsElection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditingPolitic" ADD CONSTRAINT "EditingPolitic_thread_parent_fkey" FOREIGN KEY ("thread_parent") REFERENCES "Politic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditingPolitic" ADD CONSTRAINT "EditingPolitic_tag_fkey" FOREIGN KEY ("tag") REFERENCES "Tag"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditingPolitic" ADD CONSTRAINT "EditingPolitic_politicCategory_fkey" FOREIGN KEY ("politicCategory") REFERENCES "PoliticCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditingPolitic" ADD CONSTRAINT "EditingPolitic_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditingPolitic" ADD CONSTRAINT "EditingPolitic_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EditingPolitic_positionChange" ADD CONSTRAINT "_EditingPolitic_positionChange_A_fkey" FOREIGN KEY ("A") REFERENCES "EditingPolitic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EditingPolitic_positionChange" ADD CONSTRAINT "_EditingPolitic_positionChange_B_fkey" FOREIGN KEY ("B") REFERENCES "PoliticPositionChange"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EditingPolitic_factCheck" ADD CONSTRAINT "_EditingPolitic_factCheck_A_fkey" FOREIGN KEY ("A") REFERENCES "EditingPolitic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EditingPolitic_factCheck" ADD CONSTRAINT "_EditingPolitic_factCheck_B_fkey" FOREIGN KEY ("B") REFERENCES "PoliticFactCheck"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EditingPolitic_expertPoint" ADD CONSTRAINT "_EditingPolitic_expertPoint_A_fkey" FOREIGN KEY ("A") REFERENCES "EditingPolitic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EditingPolitic_expertPoint" ADD CONSTRAINT "_EditingPolitic_expertPoint_B_fkey" FOREIGN KEY ("B") REFERENCES "PoliticExpert"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EditingPolitic_repeat" ADD CONSTRAINT "_EditingPolitic_repeat_A_fkey" FOREIGN KEY ("A") REFERENCES "EditingPolitic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EditingPolitic_repeat" ADD CONSTRAINT "_EditingPolitic_repeat_B_fkey" FOREIGN KEY ("B") REFERENCES "PoliticRepeat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EditingPolitic_controversies" ADD CONSTRAINT "_EditingPolitic_controversies_A_fkey" FOREIGN KEY ("A") REFERENCES "EditingPolitic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EditingPolitic_controversies" ADD CONSTRAINT "_EditingPolitic_controversies_B_fkey" FOREIGN KEY ("B") REFERENCES "PoliticControversie"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EditingPolitic_response" ADD CONSTRAINT "_EditingPolitic_response_A_fkey" FOREIGN KEY ("A") REFERENCES "EditingPolitic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EditingPolitic_response" ADD CONSTRAINT "_EditingPolitic_response_B_fkey" FOREIGN KEY ("B") REFERENCES "PoliticResponse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EditingPolitic_timeline" ADD CONSTRAINT "_EditingPolitic_timeline_A_fkey" FOREIGN KEY ("A") REFERENCES "EditingPolitic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EditingPolitic_timeline" ADD CONSTRAINT "_EditingPolitic_timeline_B_fkey" FOREIGN KEY ("B") REFERENCES "PoliticTimeline"("id") ON DELETE CASCADE ON UPDATE CASCADE;
