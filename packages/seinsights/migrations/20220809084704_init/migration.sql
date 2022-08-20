-- CreateEnum
CREATE TYPE "CategoryStatusType" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "ColumnTypeType" AS ENUM ('trend', 'entrepreneur', 'publication');

-- CreateEnum
CREATE TYPE "EditorChoiceStatusType" AS ENUM ('published', 'draft', 'scheduled', 'archived');

-- CreateEnum
CREATE TYPE "EventEventStatusType" AS ENUM ('opening', 'closed');

-- CreateEnum
CREATE TYPE "EventStatusType" AS ENUM ('published', 'draft', 'scheduled', 'archived');

-- CreateEnum
CREATE TYPE "EventTypeType" AS ENUM ('seinsight', 'external');

-- CreateEnum
CREATE TYPE "EventRegionType" AS ENUM ('global', 'NAME', 'EURO', 'NZAU', 'AFR', 'ME', 'LAME', 'JP', 'KR', 'HKMO', 'CH', 'SEA', 'SA', 'others', 'TW', 'KLU', 'TPH', 'TPE', 'TYC', 'HSH', 'HSC', 'MAL', 'TXG', 'NTC', 'CWH', 'YLH', 'CYI', 'CHY', 'TNN', 'KHH', 'IUH', 'TTT', 'HWA', 'ILN', 'PEH', 'KMN', 'LNN');

-- CreateEnum
CREATE TYPE "JobJobStatusType" AS ENUM ('opening', 'closed');

-- CreateEnum
CREATE TYPE "JobStatusType" AS ENUM ('published', 'draft', 'scheduled', 'archived');

-- CreateEnum
CREATE TYPE "JobTypeType" AS ENUM ('fulltime', 'parttime', 'intern', 'volunteer');

-- CreateEnum
CREATE TYPE "JobRegionType" AS ENUM ('global', 'NAME', 'EURO', 'NZAU', 'AFR', 'ME', 'LAME', 'JP', 'KR', 'HKMO', 'CH', 'SEA', 'SA', 'others', 'TW', 'KLU', 'TPH', 'TPE', 'TYC', 'HSH', 'HSC', 'MAL', 'TXG', 'NTC', 'CWH', 'YLH', 'CYI', 'CHY', 'TNN', 'KHH', 'IUH', 'TTT', 'HWA', 'ILN', 'PEH', 'KMN', 'LNN');

-- CreateEnum
CREATE TYPE "PostStatusType" AS ENUM ('published', 'draft', 'scheduled', 'archived');

-- CreateEnum
CREATE TYPE "ResourceRegionType" AS ENUM ('global', 'NAME', 'EURO', 'NZAU', 'AFR', 'ME', 'LAME', 'JP', 'KR', 'HKMO', 'CH', 'SEA', 'SA', 'others', 'TW', 'KLU', 'TPH', 'TPE', 'TYC', 'HSH', 'HSC', 'MAL', 'TXG', 'NTC', 'CWH', 'YLH', 'CYI', 'CHY', 'TNN', 'KHH', 'IUH', 'TTT', 'HWA', 'ILN', 'PEH', 'KMN', 'LNN');

-- CreateEnum
CREATE TYPE "SectionStatusType" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "SpecialfeatureStatusType" AS ENUM ('published', 'draft', 'scheduled', 'archived');

-- CreateEnum
CREATE TYPE "SpecialfeatureListStatusType" AS ENUM ('published', 'draft', 'scheduled', 'archived');

-- CreateTable
CREATE TABLE "Banner" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "order" INTEGER,
    "mobileImage" INTEGER,
    "desktopImage" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "publishDate" TIMESTAMP(3),
    "url" TEXT NOT NULL DEFAULT E'',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Banner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "slug" TEXT NOT NULL DEFAULT E'',
    "order" INTEGER,
    "status" "CategoryStatusType" NOT NULL,
    "heroImage" INTEGER,
    "section" INTEGER,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Column" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "slug" TEXT NOT NULL DEFAULT E'',
    "type" "ColumnTypeType" NOT NULL,
    "profile_photo" INTEGER,
    "intro" JSONB NOT NULL DEFAULT '[{"type":"paragraph","children":[{"text":""}]}]',

    CONSTRAINT "Column_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EditorChoice" (
    "id" SERIAL NOT NULL,
    "order" INTEGER,
    "post" INTEGER,
    "specialfeature" INTEGER,
    "status" "EditorChoiceStatusType" DEFAULT E'draft',
    "publishDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "EditorChoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "slug" TEXT NOT NULL DEFAULT E'',
    "eventStatus" "EventEventStatusType" NOT NULL,
    "status" "EventStatusType" NOT NULL DEFAULT E'draft',
    "type" "EventTypeType" NOT NULL,
    "region" "EventRegionType" NOT NULL,
    "section" INTEGER,
    "heroImage" INTEGER,
    "content" JSONB NOT NULL DEFAULT '[{"type":"paragraph","children":[{"text":""}]}]',
    "event_start" TIMESTAMP(3),
    "event_end" TIMESTAMP(3),
    "isTop" BOOLEAN NOT NULL DEFAULT false,
    "bannaerImage" INTEGER,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "slug" TEXT NOT NULL DEFAULT E'',
    "jobStatus" "JobJobStatusType" NOT NULL,
    "status" "JobStatusType" NOT NULL DEFAULT E'draft',
    "type" "JobTypeType" NOT NULL,
    "region" "JobRegionType" NOT NULL,
    "section" INTEGER,
    "company" TEXT NOT NULL DEFAULT E'',
    "profile_photo" INTEGER,
    "content" JSONB NOT NULL DEFAULT '[{"type":"paragraph","children":[{"text":""}]}]',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Image" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "copyright" TEXT,
    "imageFile_filesize" INTEGER,
    "imageFile_extension" TEXT,
    "imageFile_width" INTEGER,
    "imageFile_height" INTEGER,
    "imageFile_mode" TEXT,
    "imageFile_id" TEXT,
    "file_filesize" INTEGER,
    "file_mode" TEXT,
    "file_filename" TEXT,
    "urlOriginal" TEXT NOT NULL DEFAULT E'',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL DEFAULT E'',
    "title" TEXT NOT NULL DEFAULT E'',
    "subtitle" TEXT NOT NULL DEFAULT E'',
    "weight" INTEGER DEFAULT 85,
    "status" "PostStatusType" DEFAULT E'draft',
    "publishDate" TIMESTAMP(3),
    "section" INTEGER,
    "category" INTEGER,
    "heroImage" INTEGER,
    "heroCaption" TEXT NOT NULL DEFAULT E'',
    "brief" TEXT NOT NULL DEFAULT E'',
    "content" JSONB NOT NULL DEFAULT '[{"type":"paragraph","children":[{"text":""}]}]',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resource" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "slug" TEXT NOT NULL DEFAULT E'',
    "region" "ResourceRegionType" NOT NULL,
    "section" INTEGER,
    "profile_photo" INTEGER,
    "content" JSONB NOT NULL DEFAULT '[{"type":"paragraph","children":[{"text":""}]}]',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Section" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "slug" TEXT NOT NULL DEFAULT E'',
    "order" INTEGER,
    "status" "SectionStatusType" NOT NULL,
    "isPresent" BOOLEAN NOT NULL DEFAULT true,
    "heroImage" INTEGER,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Specialfeature" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL DEFAULT E'',
    "title" TEXT NOT NULL DEFAULT E'',
    "subtitle" TEXT NOT NULL DEFAULT E'',
    "weight" INTEGER DEFAULT 85,
    "status" "SpecialfeatureStatusType" DEFAULT E'draft',
    "publishDate" TIMESTAMP(3),
    "content" JSONB NOT NULL DEFAULT '[{"type":"paragraph","children":[{"text":""}]}]',
    "heroImage" INTEGER,
    "heroCaption" TEXT NOT NULL DEFAULT E'',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Specialfeature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpecialfeatureList" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL DEFAULT E'',
    "title" TEXT NOT NULL DEFAULT E'',
    "weight" INTEGER DEFAULT 85,
    "status" "SpecialfeatureListStatusType" DEFAULT E'draft',
    "publishDate" TIMESTAMP(3),
    "heroImage" INTEGER,
    "content" JSONB NOT NULL DEFAULT '[{"type":"paragraph","children":[{"text":""}]}]',
    "url" TEXT NOT NULL DEFAULT E'',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "SpecialfeatureList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "slug" TEXT NOT NULL DEFAULT E'',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL DEFAULT E'',
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "role" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_Column_posts" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Column_specialfeatures" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Event_tags" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Event_relatedEvents" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Job_tags" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Job_relatedJobs" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Post_tags" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Post_relatedPosts" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Specialfeature_relatedPosts" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Resource_relatedResources" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Specialfeature_specialfeatureLists" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Specialfeature_tags" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Banner_order_key" ON "Banner"("order");

-- CreateIndex
CREATE INDEX "Banner_mobileImage_idx" ON "Banner"("mobileImage");

-- CreateIndex
CREATE INDEX "Banner_desktopImage_idx" ON "Banner"("desktopImage");

-- CreateIndex
CREATE INDEX "Banner_createdBy_idx" ON "Banner"("createdBy");

-- CreateIndex
CREATE INDEX "Banner_updatedBy_idx" ON "Banner"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Category_order_key" ON "Category"("order");

-- CreateIndex
CREATE INDEX "Category_heroImage_idx" ON "Category"("heroImage");

-- CreateIndex
CREATE INDEX "Category_section_idx" ON "Category"("section");

-- CreateIndex
CREATE INDEX "Category_createdBy_idx" ON "Category"("createdBy");

-- CreateIndex
CREATE INDEX "Category_updatedBy_idx" ON "Category"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "Column_slug_key" ON "Column"("slug");

-- CreateIndex
CREATE INDEX "Column_profile_photo_idx" ON "Column"("profile_photo");

-- CreateIndex
CREATE UNIQUE INDEX "EditorChoice_order_key" ON "EditorChoice"("order");

-- CreateIndex
CREATE INDEX "EditorChoice_post_idx" ON "EditorChoice"("post");

-- CreateIndex
CREATE INDEX "EditorChoice_specialfeature_idx" ON "EditorChoice"("specialfeature");

-- CreateIndex
CREATE INDEX "EditorChoice_createdBy_idx" ON "EditorChoice"("createdBy");

-- CreateIndex
CREATE INDEX "EditorChoice_updatedBy_idx" ON "EditorChoice"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");

-- CreateIndex
CREATE INDEX "Event_section_idx" ON "Event"("section");

-- CreateIndex
CREATE INDEX "Event_heroImage_idx" ON "Event"("heroImage");

-- CreateIndex
CREATE INDEX "Event_bannaerImage_idx" ON "Event"("bannaerImage");

-- CreateIndex
CREATE INDEX "Event_createdBy_idx" ON "Event"("createdBy");

-- CreateIndex
CREATE INDEX "Event_updatedBy_idx" ON "Event"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "Job_slug_key" ON "Job"("slug");

-- CreateIndex
CREATE INDEX "Job_section_idx" ON "Job"("section");

-- CreateIndex
CREATE INDEX "Job_profile_photo_idx" ON "Job"("profile_photo");

-- CreateIndex
CREATE INDEX "Job_createdBy_idx" ON "Job"("createdBy");

-- CreateIndex
CREATE INDEX "Job_updatedBy_idx" ON "Job"("updatedBy");

-- CreateIndex
CREATE INDEX "Image_createdBy_idx" ON "Image"("createdBy");

-- CreateIndex
CREATE INDEX "Image_updatedBy_idx" ON "Image"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");

-- CreateIndex
CREATE INDEX "Post_section_idx" ON "Post"("section");

-- CreateIndex
CREATE INDEX "Post_category_idx" ON "Post"("category");

-- CreateIndex
CREATE INDEX "Post_heroImage_idx" ON "Post"("heroImage");

-- CreateIndex
CREATE INDEX "Post_createdBy_idx" ON "Post"("createdBy");

-- CreateIndex
CREATE INDEX "Post_updatedBy_idx" ON "Post"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "Resource_slug_key" ON "Resource"("slug");

-- CreateIndex
CREATE INDEX "Resource_section_idx" ON "Resource"("section");

-- CreateIndex
CREATE INDEX "Resource_profile_photo_idx" ON "Resource"("profile_photo");

-- CreateIndex
CREATE INDEX "Resource_createdBy_idx" ON "Resource"("createdBy");

-- CreateIndex
CREATE INDEX "Resource_updatedBy_idx" ON "Resource"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "Section_slug_key" ON "Section"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Section_order_key" ON "Section"("order");

-- CreateIndex
CREATE INDEX "Section_heroImage_idx" ON "Section"("heroImage");

-- CreateIndex
CREATE INDEX "Section_createdBy_idx" ON "Section"("createdBy");

-- CreateIndex
CREATE INDEX "Section_updatedBy_idx" ON "Section"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "Specialfeature_slug_key" ON "Specialfeature"("slug");

-- CreateIndex
CREATE INDEX "Specialfeature_heroImage_idx" ON "Specialfeature"("heroImage");

-- CreateIndex
CREATE INDEX "Specialfeature_createdBy_idx" ON "Specialfeature"("createdBy");

-- CreateIndex
CREATE INDEX "Specialfeature_updatedBy_idx" ON "Specialfeature"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "SpecialfeatureList_slug_key" ON "SpecialfeatureList"("slug");

-- CreateIndex
CREATE INDEX "SpecialfeatureList_heroImage_idx" ON "SpecialfeatureList"("heroImage");

-- CreateIndex
CREATE INDEX "SpecialfeatureList_createdBy_idx" ON "SpecialfeatureList"("createdBy");

-- CreateIndex
CREATE INDEX "SpecialfeatureList_updatedBy_idx" ON "SpecialfeatureList"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_slug_key" ON "Tag"("slug");

-- CreateIndex
CREATE INDEX "Tag_createdBy_idx" ON "Tag"("createdBy");

-- CreateIndex
CREATE INDEX "Tag_updatedBy_idx" ON "Tag"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_Column_posts_AB_unique" ON "_Column_posts"("A", "B");

-- CreateIndex
CREATE INDEX "_Column_posts_B_index" ON "_Column_posts"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Column_specialfeatures_AB_unique" ON "_Column_specialfeatures"("A", "B");

-- CreateIndex
CREATE INDEX "_Column_specialfeatures_B_index" ON "_Column_specialfeatures"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Event_tags_AB_unique" ON "_Event_tags"("A", "B");

-- CreateIndex
CREATE INDEX "_Event_tags_B_index" ON "_Event_tags"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Event_relatedEvents_AB_unique" ON "_Event_relatedEvents"("A", "B");

-- CreateIndex
CREATE INDEX "_Event_relatedEvents_B_index" ON "_Event_relatedEvents"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Job_tags_AB_unique" ON "_Job_tags"("A", "B");

-- CreateIndex
CREATE INDEX "_Job_tags_B_index" ON "_Job_tags"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Job_relatedJobs_AB_unique" ON "_Job_relatedJobs"("A", "B");

-- CreateIndex
CREATE INDEX "_Job_relatedJobs_B_index" ON "_Job_relatedJobs"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Post_tags_AB_unique" ON "_Post_tags"("A", "B");

-- CreateIndex
CREATE INDEX "_Post_tags_B_index" ON "_Post_tags"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Post_relatedPosts_AB_unique" ON "_Post_relatedPosts"("A", "B");

-- CreateIndex
CREATE INDEX "_Post_relatedPosts_B_index" ON "_Post_relatedPosts"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Specialfeature_relatedPosts_AB_unique" ON "_Specialfeature_relatedPosts"("A", "B");

-- CreateIndex
CREATE INDEX "_Specialfeature_relatedPosts_B_index" ON "_Specialfeature_relatedPosts"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Resource_relatedResources_AB_unique" ON "_Resource_relatedResources"("A", "B");

-- CreateIndex
CREATE INDEX "_Resource_relatedResources_B_index" ON "_Resource_relatedResources"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Specialfeature_specialfeatureLists_AB_unique" ON "_Specialfeature_specialfeatureLists"("A", "B");

-- CreateIndex
CREATE INDEX "_Specialfeature_specialfeatureLists_B_index" ON "_Specialfeature_specialfeatureLists"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Specialfeature_tags_AB_unique" ON "_Specialfeature_tags"("A", "B");

-- CreateIndex
CREATE INDEX "_Specialfeature_tags_B_index" ON "_Specialfeature_tags"("B");

-- AddForeignKey
ALTER TABLE "Banner" ADD CONSTRAINT "Banner_mobileImage_fkey" FOREIGN KEY ("mobileImage") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Banner" ADD CONSTRAINT "Banner_desktopImage_fkey" FOREIGN KEY ("desktopImage") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Banner" ADD CONSTRAINT "Banner_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Banner" ADD CONSTRAINT "Banner_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_heroImage_fkey" FOREIGN KEY ("heroImage") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_section_fkey" FOREIGN KEY ("section") REFERENCES "Section"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Column" ADD CONSTRAINT "Column_profile_photo_fkey" FOREIGN KEY ("profile_photo") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditorChoice" ADD CONSTRAINT "EditorChoice_post_fkey" FOREIGN KEY ("post") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditorChoice" ADD CONSTRAINT "EditorChoice_specialfeature_fkey" FOREIGN KEY ("specialfeature") REFERENCES "Specialfeature"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditorChoice" ADD CONSTRAINT "EditorChoice_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditorChoice" ADD CONSTRAINT "EditorChoice_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_heroImage_fkey" FOREIGN KEY ("heroImage") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_bannaerImage_fkey" FOREIGN KEY ("bannaerImage") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_section_fkey" FOREIGN KEY ("section") REFERENCES "Section"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_profile_photo_fkey" FOREIGN KEY ("profile_photo") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_section_fkey" FOREIGN KEY ("section") REFERENCES "Section"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_category_fkey" FOREIGN KEY ("category") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_heroImage_fkey" FOREIGN KEY ("heroImage") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_section_fkey" FOREIGN KEY ("section") REFERENCES "Section"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_profile_photo_fkey" FOREIGN KEY ("profile_photo") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_section_fkey" FOREIGN KEY ("section") REFERENCES "Section"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_heroImage_fkey" FOREIGN KEY ("heroImage") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Specialfeature" ADD CONSTRAINT "Specialfeature_heroImage_fkey" FOREIGN KEY ("heroImage") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Specialfeature" ADD CONSTRAINT "Specialfeature_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Specialfeature" ADD CONSTRAINT "Specialfeature_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpecialfeatureList" ADD CONSTRAINT "SpecialfeatureList_heroImage_fkey" FOREIGN KEY ("heroImage") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpecialfeatureList" ADD CONSTRAINT "SpecialfeatureList_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpecialfeatureList" ADD CONSTRAINT "SpecialfeatureList_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Column_posts" ADD FOREIGN KEY ("A") REFERENCES "Column"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Column_posts" ADD FOREIGN KEY ("B") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Column_specialfeatures" ADD FOREIGN KEY ("A") REFERENCES "Column"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Column_specialfeatures" ADD FOREIGN KEY ("B") REFERENCES "Specialfeature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Event_tags" ADD FOREIGN KEY ("A") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Event_tags" ADD FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Event_relatedEvents" ADD FOREIGN KEY ("A") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Event_relatedEvents" ADD FOREIGN KEY ("B") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Job_tags" ADD FOREIGN KEY ("A") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Job_tags" ADD FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Job_relatedJobs" ADD FOREIGN KEY ("A") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Job_relatedJobs" ADD FOREIGN KEY ("B") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_tags" ADD FOREIGN KEY ("A") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_tags" ADD FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_relatedPosts" ADD FOREIGN KEY ("A") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_relatedPosts" ADD FOREIGN KEY ("B") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Specialfeature_relatedPosts" ADD FOREIGN KEY ("A") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Specialfeature_relatedPosts" ADD FOREIGN KEY ("B") REFERENCES "Specialfeature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Resource_relatedResources" ADD FOREIGN KEY ("A") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Resource_relatedResources" ADD FOREIGN KEY ("B") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Specialfeature_specialfeatureLists" ADD FOREIGN KEY ("A") REFERENCES "Specialfeature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Specialfeature_specialfeatureLists" ADD FOREIGN KEY ("B") REFERENCES "SpecialfeatureList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Specialfeature_tags" ADD FOREIGN KEY ("A") REFERENCES "Specialfeature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Specialfeature_tags" ADD FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
