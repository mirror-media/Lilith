/*
  Warnings:

  - You are about to drop the column `section` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `section` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `section` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `section` on the `Resource` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `Specialfeature` table. All the data in the column will be lost.
  - You are about to drop the column `section` on the `Specialfeature` table. All the data in the column will be lost.
  - You are about to drop the column `section` on the `SpecialfeatureList` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_section_fkey";

-- DropForeignKey
ALTER TABLE "Job" DROP CONSTRAINT "Job_section_fkey";

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_category_fkey";

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_section_fkey";

-- DropForeignKey
ALTER TABLE "Resource" DROP CONSTRAINT "Resource_section_fkey";

-- DropForeignKey
ALTER TABLE "Specialfeature" DROP CONSTRAINT "Specialfeature_category_fkey";

-- DropForeignKey
ALTER TABLE "Specialfeature" DROP CONSTRAINT "Specialfeature_section_fkey";

-- DropForeignKey
ALTER TABLE "SpecialfeatureList" DROP CONSTRAINT "SpecialfeatureList_section_fkey";

-- DropIndex
DROP INDEX "Event_section_idx";

-- DropIndex
DROP INDEX "Job_section_idx";

-- DropIndex
DROP INDEX "Post_category_idx";

-- DropIndex
DROP INDEX "Post_section_idx";

-- DropIndex
DROP INDEX "Resource_section_idx";

-- DropIndex
DROP INDEX "Specialfeature_category_idx";

-- DropIndex
DROP INDEX "Specialfeature_section_idx";

-- DropIndex
DROP INDEX "SpecialfeatureList_section_idx";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "section";

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "section";

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "category",
DROP COLUMN "section";

-- AlterTable
ALTER TABLE "Resource" DROP COLUMN "section";

-- AlterTable
ALTER TABLE "Specialfeature" DROP COLUMN "category",
DROP COLUMN "section";

-- AlterTable
ALTER TABLE "SpecialfeatureList" DROP COLUMN "section";

-- CreateTable
CREATE TABLE "_Category_posts" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Category_specialfeatures" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Category_events" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Category_jobs" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Category_resources" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Event_section" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Job_section" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Post_section" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Resource_section" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Section_specialfeatures" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Section_specialfeatureLists" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_Category_posts_AB_unique" ON "_Category_posts"("A", "B");

-- CreateIndex
CREATE INDEX "_Category_posts_B_index" ON "_Category_posts"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Category_specialfeatures_AB_unique" ON "_Category_specialfeatures"("A", "B");

-- CreateIndex
CREATE INDEX "_Category_specialfeatures_B_index" ON "_Category_specialfeatures"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Category_events_AB_unique" ON "_Category_events"("A", "B");

-- CreateIndex
CREATE INDEX "_Category_events_B_index" ON "_Category_events"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Category_jobs_AB_unique" ON "_Category_jobs"("A", "B");

-- CreateIndex
CREATE INDEX "_Category_jobs_B_index" ON "_Category_jobs"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Category_resources_AB_unique" ON "_Category_resources"("A", "B");

-- CreateIndex
CREATE INDEX "_Category_resources_B_index" ON "_Category_resources"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Event_section_AB_unique" ON "_Event_section"("A", "B");

-- CreateIndex
CREATE INDEX "_Event_section_B_index" ON "_Event_section"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Job_section_AB_unique" ON "_Job_section"("A", "B");

-- CreateIndex
CREATE INDEX "_Job_section_B_index" ON "_Job_section"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Post_section_AB_unique" ON "_Post_section"("A", "B");

-- CreateIndex
CREATE INDEX "_Post_section_B_index" ON "_Post_section"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Resource_section_AB_unique" ON "_Resource_section"("A", "B");

-- CreateIndex
CREATE INDEX "_Resource_section_B_index" ON "_Resource_section"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Section_specialfeatures_AB_unique" ON "_Section_specialfeatures"("A", "B");

-- CreateIndex
CREATE INDEX "_Section_specialfeatures_B_index" ON "_Section_specialfeatures"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Section_specialfeatureLists_AB_unique" ON "_Section_specialfeatureLists"("A", "B");

-- CreateIndex
CREATE INDEX "_Section_specialfeatureLists_B_index" ON "_Section_specialfeatureLists"("B");

-- AddForeignKey
ALTER TABLE "_Category_posts" ADD FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Category_posts" ADD FOREIGN KEY ("B") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Category_specialfeatures" ADD FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Category_specialfeatures" ADD FOREIGN KEY ("B") REFERENCES "Specialfeature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Category_events" ADD FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Category_events" ADD FOREIGN KEY ("B") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Category_jobs" ADD FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Category_jobs" ADD FOREIGN KEY ("B") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Category_resources" ADD FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Category_resources" ADD FOREIGN KEY ("B") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Event_section" ADD FOREIGN KEY ("A") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Event_section" ADD FOREIGN KEY ("B") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Job_section" ADD FOREIGN KEY ("A") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Job_section" ADD FOREIGN KEY ("B") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_section" ADD FOREIGN KEY ("A") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_section" ADD FOREIGN KEY ("B") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Resource_section" ADD FOREIGN KEY ("A") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Resource_section" ADD FOREIGN KEY ("B") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Section_specialfeatures" ADD FOREIGN KEY ("A") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Section_specialfeatures" ADD FOREIGN KEY ("B") REFERENCES "Specialfeature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Section_specialfeatureLists" ADD FOREIGN KEY ("A") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Section_specialfeatureLists" ADD FOREIGN KEY ("B") REFERENCES "SpecialfeatureList"("id") ON DELETE CASCADE ON UPDATE CASCADE;
