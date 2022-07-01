-- CreateEnum
CREATE TYPE "FormTypeType" AS ENUM ('qa', 'form', 'questionniare', 'quiz');

-- CreateEnum
CREATE TYPE "FieldTypeType" AS ENUM ('single', 'multiple', 'text', 'checkbox');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "email" TEXT NOT NULL DEFAULT E'',
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "isProtected" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LiveblogItem" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL DEFAULT E'',
    "status" TEXT DEFAULT E'draft',
    "publishTime" TIMESTAMP(3),
    "heroImage" INTEGER,
    "author" TEXT NOT NULL DEFAULT E'',
    "name" JSONB,
    "boost" BOOLEAN NOT NULL DEFAULT false,
    "liveblog" INTEGER,
    "tags" INTEGER,
    "apiData" JSONB,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "LiveblogItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Liveblog" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "slug" TEXT NOT NULL DEFAULT E'',
    "desc" TEXT NOT NULL DEFAULT E'',
    "heroImage" INTEGER,
    "heroVideo" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "tags" INTEGER,
    "publisher" INTEGER,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Liveblog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Publisher" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "slug" TEXT NOT NULL DEFAULT E'',
    "intro" TEXT NOT NULL DEFAULT E'',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "template" TEXT NOT NULL DEFAULT E'',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Publisher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AudioFile" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "file_filesize" INTEGER,
    "file_mode" TEXT,
    "file_filename" TEXT,
    "coverPhoto" INTEGER,
    "tags" TEXT NOT NULL DEFAULT E'',
    "meta" TEXT NOT NULL DEFAULT E'',
    "url" TEXT NOT NULL DEFAULT E'',
    "duration" TEXT NOT NULL DEFAULT E'',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "AudioFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Video" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "youtubeUrl" TEXT NOT NULL DEFAULT E'',
    "file_filesize" INTEGER,
    "file_mode" TEXT,
    "file_filename" TEXT,
    "coverPhoto" INTEGER,
    "description" TEXT NOT NULL DEFAULT E'',
    "tags" TEXT NOT NULL DEFAULT E'',
    "meta" TEXT NOT NULL DEFAULT E'',
    "url" TEXT NOT NULL DEFAULT E'',
    "duration" TEXT NOT NULL DEFAULT E'',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Image" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
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
CREATE TABLE "Tag" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Form" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "slug" TEXT NOT NULL DEFAULT E'',
    "type" "FormTypeType" NOT NULL,
    "content" JSONB,
    "heroImage" INTEGER,
    "heroVideo" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "updateTime" TIMESTAMP(3),
    "publisher" INTEGER,
    "apiData" JSONB,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Form_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Field" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "type" "FieldTypeType" NOT NULL,
    "status" TEXT DEFAULT E'draft',
    "heroImage" INTEGER,
    "content" JSONB,
    "sortOrder" INTEGER,
    "form" INTEGER,
    "apiData" JSONB,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Field_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FieldOption" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "heroImage" INTEGER,
    "content" TEXT NOT NULL DEFAULT E'',
    "value" TEXT NOT NULL DEFAULT E'',
    "sortOrder" INTEGER,
    "field" INTEGER,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "FieldOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormAnswer" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "result" TEXT NOT NULL DEFAULT E'',
    "heroImage" INTEGER,
    "content" JSONB,
    "form" INTEGER,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "FormAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormResult" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "ip" TEXT NOT NULL DEFAULT E'',
    "result" TEXT NOT NULL DEFAULT E'',
    "responseTime" TIMESTAMP(3),
    "form" INTEGER,
    "field" INTEGER,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "FormResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Condition" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "formField" INTEGER,
    "compare" TEXT NOT NULL,
    "option" INTEGER,
    "conditionCollection" INTEGER,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Condition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConditionCollection" (
    "id" SERIAL NOT NULL,
    "type" TEXT DEFAULT E'AND',
    "answer" INTEGER,
    "next" INTEGER,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "ConditionCollection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL DEFAULT E'',
    "status" TEXT DEFAULT E'draft',
    "publishTime" TIMESTAMP(3),
    "heroImage" INTEGER,
    "author" TEXT NOT NULL DEFAULT E'',
    "content" JSONB,
    "boost" BOOLEAN NOT NULL DEFAULT false,
    "apiData" JSONB,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_Question_tags" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Form_tags" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Form_questions" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "LiveblogItem_heroImage_idx" ON "LiveblogItem"("heroImage");

-- CreateIndex
CREATE INDEX "LiveblogItem_liveblog_idx" ON "LiveblogItem"("liveblog");

-- CreateIndex
CREATE INDEX "LiveblogItem_tags_idx" ON "LiveblogItem"("tags");

-- CreateIndex
CREATE INDEX "LiveblogItem_createdBy_idx" ON "LiveblogItem"("createdBy");

-- CreateIndex
CREATE INDEX "LiveblogItem_updatedBy_idx" ON "LiveblogItem"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "Liveblog_slug_key" ON "Liveblog"("slug");

-- CreateIndex
CREATE INDEX "Liveblog_heroImage_idx" ON "Liveblog"("heroImage");

-- CreateIndex
CREATE INDEX "Liveblog_heroVideo_idx" ON "Liveblog"("heroVideo");

-- CreateIndex
CREATE INDEX "Liveblog_tags_idx" ON "Liveblog"("tags");

-- CreateIndex
CREATE INDEX "Liveblog_publisher_idx" ON "Liveblog"("publisher");

-- CreateIndex
CREATE INDEX "Liveblog_createdBy_idx" ON "Liveblog"("createdBy");

-- CreateIndex
CREATE INDEX "Liveblog_updatedBy_idx" ON "Liveblog"("updatedBy");

-- CreateIndex
CREATE INDEX "Publisher_createdBy_idx" ON "Publisher"("createdBy");

-- CreateIndex
CREATE INDEX "Publisher_updatedBy_idx" ON "Publisher"("updatedBy");

-- CreateIndex
CREATE INDEX "AudioFile_coverPhoto_idx" ON "AudioFile"("coverPhoto");

-- CreateIndex
CREATE INDEX "AudioFile_createdBy_idx" ON "AudioFile"("createdBy");

-- CreateIndex
CREATE INDEX "AudioFile_updatedBy_idx" ON "AudioFile"("updatedBy");

-- CreateIndex
CREATE INDEX "Video_coverPhoto_idx" ON "Video"("coverPhoto");

-- CreateIndex
CREATE INDEX "Video_createdBy_idx" ON "Video"("createdBy");

-- CreateIndex
CREATE INDEX "Video_updatedBy_idx" ON "Video"("updatedBy");

-- CreateIndex
CREATE INDEX "Image_createdBy_idx" ON "Image"("createdBy");

-- CreateIndex
CREATE INDEX "Image_updatedBy_idx" ON "Image"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE INDEX "Tag_createdBy_idx" ON "Tag"("createdBy");

-- CreateIndex
CREATE INDEX "Tag_updatedBy_idx" ON "Tag"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "Form_slug_key" ON "Form"("slug");

-- CreateIndex
CREATE INDEX "Form_heroImage_idx" ON "Form"("heroImage");

-- CreateIndex
CREATE INDEX "Form_heroVideo_idx" ON "Form"("heroVideo");

-- CreateIndex
CREATE INDEX "Form_publisher_idx" ON "Form"("publisher");

-- CreateIndex
CREATE INDEX "Form_createdBy_idx" ON "Form"("createdBy");

-- CreateIndex
CREATE INDEX "Form_updatedBy_idx" ON "Form"("updatedBy");

-- CreateIndex
CREATE INDEX "Field_heroImage_idx" ON "Field"("heroImage");

-- CreateIndex
CREATE INDEX "Field_form_idx" ON "Field"("form");

-- CreateIndex
CREATE INDEX "Field_createdBy_idx" ON "Field"("createdBy");

-- CreateIndex
CREATE INDEX "Field_updatedBy_idx" ON "Field"("updatedBy");

-- CreateIndex
CREATE INDEX "FieldOption_heroImage_idx" ON "FieldOption"("heroImage");

-- CreateIndex
CREATE INDEX "FieldOption_field_idx" ON "FieldOption"("field");

-- CreateIndex
CREATE INDEX "FieldOption_createdBy_idx" ON "FieldOption"("createdBy");

-- CreateIndex
CREATE INDEX "FieldOption_updatedBy_idx" ON "FieldOption"("updatedBy");

-- CreateIndex
CREATE INDEX "FormAnswer_heroImage_idx" ON "FormAnswer"("heroImage");

-- CreateIndex
CREATE INDEX "FormAnswer_form_idx" ON "FormAnswer"("form");

-- CreateIndex
CREATE INDEX "FormAnswer_createdBy_idx" ON "FormAnswer"("createdBy");

-- CreateIndex
CREATE INDEX "FormAnswer_updatedBy_idx" ON "FormAnswer"("updatedBy");

-- CreateIndex
CREATE INDEX "FormResult_form_idx" ON "FormResult"("form");

-- CreateIndex
CREATE INDEX "FormResult_field_idx" ON "FormResult"("field");

-- CreateIndex
CREATE INDEX "FormResult_createdBy_idx" ON "FormResult"("createdBy");

-- CreateIndex
CREATE INDEX "FormResult_updatedBy_idx" ON "FormResult"("updatedBy");

-- CreateIndex
CREATE INDEX "Condition_formField_idx" ON "Condition"("formField");

-- CreateIndex
CREATE INDEX "Condition_option_idx" ON "Condition"("option");

-- CreateIndex
CREATE INDEX "Condition_conditionCollection_idx" ON "Condition"("conditionCollection");

-- CreateIndex
CREATE INDEX "Condition_createdBy_idx" ON "Condition"("createdBy");

-- CreateIndex
CREATE INDEX "Condition_updatedBy_idx" ON "Condition"("updatedBy");

-- CreateIndex
CREATE INDEX "ConditionCollection_answer_idx" ON "ConditionCollection"("answer");

-- CreateIndex
CREATE INDEX "ConditionCollection_next_idx" ON "ConditionCollection"("next");

-- CreateIndex
CREATE INDEX "ConditionCollection_createdBy_idx" ON "ConditionCollection"("createdBy");

-- CreateIndex
CREATE INDEX "ConditionCollection_updatedBy_idx" ON "ConditionCollection"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "Question_title_key" ON "Question"("title");

-- CreateIndex
CREATE INDEX "Question_heroImage_idx" ON "Question"("heroImage");

-- CreateIndex
CREATE INDEX "Question_createdBy_idx" ON "Question"("createdBy");

-- CreateIndex
CREATE INDEX "Question_updatedBy_idx" ON "Question"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "_Question_tags_AB_unique" ON "_Question_tags"("A", "B");

-- CreateIndex
CREATE INDEX "_Question_tags_B_index" ON "_Question_tags"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Form_tags_AB_unique" ON "_Form_tags"("A", "B");

-- CreateIndex
CREATE INDEX "_Form_tags_B_index" ON "_Form_tags"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Form_questions_AB_unique" ON "_Form_questions"("A", "B");

-- CreateIndex
CREATE INDEX "_Form_questions_B_index" ON "_Form_questions"("B");

-- AddForeignKey
ALTER TABLE "LiveblogItem" ADD CONSTRAINT "LiveblogItem_heroImage_fkey" FOREIGN KEY ("heroImage") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveblogItem" ADD CONSTRAINT "LiveblogItem_liveblog_fkey" FOREIGN KEY ("liveblog") REFERENCES "Liveblog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveblogItem" ADD CONSTRAINT "LiveblogItem_tags_fkey" FOREIGN KEY ("tags") REFERENCES "Tag"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveblogItem" ADD CONSTRAINT "LiveblogItem_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveblogItem" ADD CONSTRAINT "LiveblogItem_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Liveblog" ADD CONSTRAINT "Liveblog_heroImage_fkey" FOREIGN KEY ("heroImage") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Liveblog" ADD CONSTRAINT "Liveblog_heroVideo_fkey" FOREIGN KEY ("heroVideo") REFERENCES "Video"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Liveblog" ADD CONSTRAINT "Liveblog_tags_fkey" FOREIGN KEY ("tags") REFERENCES "Tag"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Liveblog" ADD CONSTRAINT "Liveblog_publisher_fkey" FOREIGN KEY ("publisher") REFERENCES "Publisher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Liveblog" ADD CONSTRAINT "Liveblog_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Liveblog" ADD CONSTRAINT "Liveblog_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Publisher" ADD CONSTRAINT "Publisher_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Publisher" ADD CONSTRAINT "Publisher_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AudioFile" ADD CONSTRAINT "AudioFile_coverPhoto_fkey" FOREIGN KEY ("coverPhoto") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AudioFile" ADD CONSTRAINT "AudioFile_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AudioFile" ADD CONSTRAINT "AudioFile_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_coverPhoto_fkey" FOREIGN KEY ("coverPhoto") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Form" ADD CONSTRAINT "Form_heroImage_fkey" FOREIGN KEY ("heroImage") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Form" ADD CONSTRAINT "Form_heroVideo_fkey" FOREIGN KEY ("heroVideo") REFERENCES "Video"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Form" ADD CONSTRAINT "Form_publisher_fkey" FOREIGN KEY ("publisher") REFERENCES "Publisher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Form" ADD CONSTRAINT "Form_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Form" ADD CONSTRAINT "Form_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Field" ADD CONSTRAINT "Field_heroImage_fkey" FOREIGN KEY ("heroImage") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Field" ADD CONSTRAINT "Field_form_fkey" FOREIGN KEY ("form") REFERENCES "Form"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Field" ADD CONSTRAINT "Field_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Field" ADD CONSTRAINT "Field_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FieldOption" ADD CONSTRAINT "FieldOption_heroImage_fkey" FOREIGN KEY ("heroImage") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FieldOption" ADD CONSTRAINT "FieldOption_field_fkey" FOREIGN KEY ("field") REFERENCES "Field"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FieldOption" ADD CONSTRAINT "FieldOption_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FieldOption" ADD CONSTRAINT "FieldOption_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormAnswer" ADD CONSTRAINT "FormAnswer_heroImage_fkey" FOREIGN KEY ("heroImage") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormAnswer" ADD CONSTRAINT "FormAnswer_form_fkey" FOREIGN KEY ("form") REFERENCES "Form"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormAnswer" ADD CONSTRAINT "FormAnswer_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormAnswer" ADD CONSTRAINT "FormAnswer_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormResult" ADD CONSTRAINT "FormResult_form_fkey" FOREIGN KEY ("form") REFERENCES "Form"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormResult" ADD CONSTRAINT "FormResult_field_fkey" FOREIGN KEY ("field") REFERENCES "Field"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormResult" ADD CONSTRAINT "FormResult_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormResult" ADD CONSTRAINT "FormResult_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Condition" ADD CONSTRAINT "Condition_formField_fkey" FOREIGN KEY ("formField") REFERENCES "Field"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Condition" ADD CONSTRAINT "Condition_option_fkey" FOREIGN KEY ("option") REFERENCES "FieldOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Condition" ADD CONSTRAINT "Condition_conditionCollection_fkey" FOREIGN KEY ("conditionCollection") REFERENCES "ConditionCollection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Condition" ADD CONSTRAINT "Condition_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Condition" ADD CONSTRAINT "Condition_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConditionCollection" ADD CONSTRAINT "ConditionCollection_answer_fkey" FOREIGN KEY ("answer") REFERENCES "FormAnswer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConditionCollection" ADD CONSTRAINT "ConditionCollection_next_fkey" FOREIGN KEY ("next") REFERENCES "Field"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConditionCollection" ADD CONSTRAINT "ConditionCollection_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConditionCollection" ADD CONSTRAINT "ConditionCollection_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_heroImage_fkey" FOREIGN KEY ("heroImage") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Question_tags" ADD FOREIGN KEY ("A") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Question_tags" ADD FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Form_tags" ADD FOREIGN KEY ("A") REFERENCES "Form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Form_tags" ADD FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Form_questions" ADD FOREIGN KEY ("A") REFERENCES "Form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Form_questions" ADD FOREIGN KEY ("B") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
