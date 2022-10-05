/*
  Warnings:

  - You are about to drop the column `bannaerImage` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `isTop` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `subtitle` on the `Post` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "EventBannerStatusType" AS ENUM ('published', 'draft', 'scheduled', 'archived');

-- CreateEnum
CREATE TYPE "HomepageBannerStatusType" AS ENUM ('published', 'draft', 'scheduled', 'archived');

-- CreateEnum
CREATE TYPE "JobBannerStatusType" AS ENUM ('published', 'draft', 'scheduled', 'archived');

-- CreateEnum
CREATE TYPE "ResourceBannerStatusType" AS ENUM ('published', 'draft', 'scheduled', 'archived');

-- CreateEnum
CREATE TYPE "SpecialfeatureEditorChoiceStatusType" AS ENUM ('published', 'draft', 'scheduled', 'archived');

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_bannaerImage_fkey";

-- DropIndex
DROP INDEX "Event_bannaerImage_idx";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "bannaerImage",
DROP COLUMN "isTop";

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "subtitle";

-- AlterTable
ALTER TABLE "SpecialfeatureList" ADD COLUMN     "section" INTEGER;

-- CreateTable
CREATE TABLE "AboutUs" (
    "id" SERIAL NOT NULL,
    "aboutUs" JSONB,
    "apiData" JSONB,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "AboutUs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventBanner" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "order" INTEGER,
    "heroImage" INTEGER,
    "status" "EventBannerStatusType" DEFAULT 'draft',
    "publishDate" TIMESTAMP(3),
    "url" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "EventBanner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomepageBanner" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "order" INTEGER,
    "heroImage" INTEGER,
    "status" "HomepageBannerStatusType" DEFAULT 'draft',
    "publishDate" TIMESTAMP(3),
    "url" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "HomepageBanner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobBanner" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "order" INTEGER,
    "heroImage" INTEGER,
    "status" "JobBannerStatusType" DEFAULT 'draft',
    "publishDate" TIMESTAMP(3),
    "url" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "JobBanner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Menubar" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "order" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "publishDate" TIMESTAMP(3),
    "url" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Menubar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResourceBanner" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "order" INTEGER,
    "heroImage" INTEGER,
    "status" "ResourceBannerStatusType" DEFAULT 'draft',
    "publishDate" TIMESTAMP(3),
    "url" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "ResourceBanner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpecialfeatureEditorChoice" (
    "id" SERIAL NOT NULL,
    "order" INTEGER,
    "specialfeature" INTEGER,
    "status" "SpecialfeatureEditorChoiceStatusType" DEFAULT 'draft',
    "publishDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "SpecialfeatureEditorChoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AboutUs_createdBy_idx" ON "AboutUs"("createdBy");

-- CreateIndex
CREATE INDEX "AboutUs_updatedBy_idx" ON "AboutUs"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "EventBanner_order_key" ON "EventBanner"("order");

-- CreateIndex
CREATE INDEX "EventBanner_heroImage_idx" ON "EventBanner"("heroImage");

-- CreateIndex
CREATE INDEX "EventBanner_createdBy_idx" ON "EventBanner"("createdBy");

-- CreateIndex
CREATE INDEX "EventBanner_updatedBy_idx" ON "EventBanner"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "HomepageBanner_order_key" ON "HomepageBanner"("order");

-- CreateIndex
CREATE INDEX "HomepageBanner_heroImage_idx" ON "HomepageBanner"("heroImage");

-- CreateIndex
CREATE INDEX "HomepageBanner_createdBy_idx" ON "HomepageBanner"("createdBy");

-- CreateIndex
CREATE INDEX "HomepageBanner_updatedBy_idx" ON "HomepageBanner"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "JobBanner_order_key" ON "JobBanner"("order");

-- CreateIndex
CREATE INDEX "JobBanner_heroImage_idx" ON "JobBanner"("heroImage");

-- CreateIndex
CREATE INDEX "JobBanner_createdBy_idx" ON "JobBanner"("createdBy");

-- CreateIndex
CREATE INDEX "JobBanner_updatedBy_idx" ON "JobBanner"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "Menubar_order_key" ON "Menubar"("order");

-- CreateIndex
CREATE INDEX "Menubar_createdBy_idx" ON "Menubar"("createdBy");

-- CreateIndex
CREATE INDEX "Menubar_updatedBy_idx" ON "Menubar"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "ResourceBanner_order_key" ON "ResourceBanner"("order");

-- CreateIndex
CREATE INDEX "ResourceBanner_heroImage_idx" ON "ResourceBanner"("heroImage");

-- CreateIndex
CREATE INDEX "ResourceBanner_createdBy_idx" ON "ResourceBanner"("createdBy");

-- CreateIndex
CREATE INDEX "ResourceBanner_updatedBy_idx" ON "ResourceBanner"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "SpecialfeatureEditorChoice_order_key" ON "SpecialfeatureEditorChoice"("order");

-- CreateIndex
CREATE INDEX "SpecialfeatureEditorChoice_specialfeature_idx" ON "SpecialfeatureEditorChoice"("specialfeature");

-- CreateIndex
CREATE INDEX "SpecialfeatureEditorChoice_createdBy_idx" ON "SpecialfeatureEditorChoice"("createdBy");

-- CreateIndex
CREATE INDEX "SpecialfeatureEditorChoice_updatedBy_idx" ON "SpecialfeatureEditorChoice"("updatedBy");

-- CreateIndex
CREATE INDEX "SpecialfeatureList_section_idx" ON "SpecialfeatureList"("section");

-- AddForeignKey
ALTER TABLE "SpecialfeatureList" ADD CONSTRAINT "SpecialfeatureList_section_fkey" FOREIGN KEY ("section") REFERENCES "Section"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AboutUs" ADD CONSTRAINT "AboutUs_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AboutUs" ADD CONSTRAINT "AboutUs_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventBanner" ADD CONSTRAINT "EventBanner_heroImage_fkey" FOREIGN KEY ("heroImage") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventBanner" ADD CONSTRAINT "EventBanner_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventBanner" ADD CONSTRAINT "EventBanner_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomepageBanner" ADD CONSTRAINT "HomepageBanner_heroImage_fkey" FOREIGN KEY ("heroImage") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomepageBanner" ADD CONSTRAINT "HomepageBanner_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomepageBanner" ADD CONSTRAINT "HomepageBanner_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobBanner" ADD CONSTRAINT "JobBanner_heroImage_fkey" FOREIGN KEY ("heroImage") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobBanner" ADD CONSTRAINT "JobBanner_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobBanner" ADD CONSTRAINT "JobBanner_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Menubar" ADD CONSTRAINT "Menubar_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Menubar" ADD CONSTRAINT "Menubar_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceBanner" ADD CONSTRAINT "ResourceBanner_heroImage_fkey" FOREIGN KEY ("heroImage") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceBanner" ADD CONSTRAINT "ResourceBanner_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceBanner" ADD CONSTRAINT "ResourceBanner_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpecialfeatureEditorChoice" ADD CONSTRAINT "SpecialfeatureEditorChoice_specialfeature_fkey" FOREIGN KEY ("specialfeature") REFERENCES "Specialfeature"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpecialfeatureEditorChoice" ADD CONSTRAINT "SpecialfeatureEditorChoice_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpecialfeatureEditorChoice" ADD CONSTRAINT "SpecialfeatureEditorChoice_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
