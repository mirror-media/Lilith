-- CreateTable
CREATE TABLE "Post" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL DEFAULT E'',
    "title" TEXT NOT NULL DEFAULT E'',
    "subtitle" TEXT NOT NULL DEFAULT E'',
    "state" TEXT DEFAULT E'draft',
    "publishedDate" TIMESTAMP(3),
    "extend_byline" TEXT NOT NULL DEFAULT E'',
    "heroVideo" INTEGER,
    "heroImage" INTEGER,
    "heroCaption" TEXT NOT NULL DEFAULT E'',
    "heroImageSize" TEXT DEFAULT E'normal',
    "style" TEXT DEFAULT E'article',
    "brief" TEXT NOT NULL DEFAULT E'',
    "content" JSONB,
    "topics" INTEGER,
    "titleColor" TEXT,
    "og_title" TEXT NOT NULL DEFAULT E'',
    "og_description" TEXT NOT NULL DEFAULT E'',
    "og_image" INTEGER,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isAdvertised" BOOLEAN NOT NULL DEFAULT false,
    "hiddenAdvertised" BOOLEAN NOT NULL DEFAULT false,
    "isCampaign" BOOLEAN NOT NULL DEFAULT false,
    "isAdult" BOOLEAN NOT NULL DEFAULT false,
    "lockJS" BOOLEAN NOT NULL DEFAULT false,
    "isAudioSiteOnly" BOOLEAN NOT NULL DEFAULT false,
    "device" TEXT DEFAULT E'all',
    "css" TEXT NOT NULL DEFAULT E'',
    "adTrace" TEXT NOT NULL DEFAULT E'',
    "redirect" TEXT NOT NULL DEFAULT E'',
    "createTime" TIMESTAMP(3),
    "apiData" JSONB,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EditorChoice" (
    "id" SERIAL NOT NULL,
    "state" TEXT DEFAULT E'draft',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "EditorChoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "subtitle" TEXT NOT NULL DEFAULT E'',
    "state" TEXT DEFAULT E'draft',
    "brief" TEXT NOT NULL DEFAULT E'',
    "leading" TEXT,
    "heroVideo" INTEGER,
    "heroImage" INTEGER,
    "heroImageSize" TEXT DEFAULT E'normal',
    "og_title" TEXT NOT NULL DEFAULT E'',
    "og_description" TEXT NOT NULL DEFAULT E'',
    "og_image" INTEGER,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "title_style" TEXT DEFAULT E'feature',
    "type" TEXT DEFAULT E'list',
    "source" TEXT,
    "sort" TEXT,
    "style" TEXT NOT NULL DEFAULT E'',
    "javascript" TEXT NOT NULL DEFAULT E'',
    "dfp" TEXT NOT NULL DEFAULT E'',
    "mobile_dfp" TEXT NOT NULL DEFAULT E'',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Magazine" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL DEFAULT E'',
    "issue" TEXT NOT NULL DEFAULT E'',
    "description" TEXT NOT NULL DEFAULT E'',
    "coverPhoto" INTEGER,
    "type" TEXT DEFAULT E'weekly',
    "publishedDate" TIMESTAMP(3),
    "state" TEXT DEFAULT E'draft',
    "createTime" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Magazine_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "Contact" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "email" TEXT NOT NULL DEFAULT E'',
    "image" INTEGER,
    "homepage" TEXT NOT NULL DEFAULT E'',
    "facebook" TEXT NOT NULL DEFAULT E'',
    "twitter" TEXT NOT NULL DEFAULT E'',
    "instantgram" TEXT NOT NULL DEFAULT E'',
    "address" TEXT NOT NULL DEFAULT E'',
    "bio" TEXT NOT NULL DEFAULT E'',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "Section" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "title" TEXT NOT NULL DEFAULT E'',
    "description" TEXT NOT NULL DEFAULT E'',
    "heroImage" INTEGER,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "style" TEXT,
    "og_title" TEXT NOT NULL DEFAULT E'',
    "og_description" TEXT NOT NULL DEFAULT E'',
    "og_image" INTEGER,
    "isMemberOnly" BOOLEAN NOT NULL DEFAULT false,
    "timeline" TEXT NOT NULL DEFAULT E'',
    "css" TEXT NOT NULL DEFAULT E'',
    "javascript" TEXT NOT NULL DEFAULT E'',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AudioFile" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "file_filesize" INTEGER,
    "file_mode" TEXT,
    "file_filename" TEXT,
    "description" TEXT NOT NULL DEFAULT E'',
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
CREATE TABLE "External" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "partner" INTEGER,
    "title" TEXT NOT NULL DEFAULT E'',
    "subtitle" TEXT NOT NULL DEFAULT E'',
    "state" TEXT DEFAULT E'draft',
    "publishedDate" TIMESTAMP(3),
    "extend_byline" TEXT NOT NULL DEFAULT E'',
    "thumb" TEXT NOT NULL DEFAULT E'',
    "brief" TEXT NOT NULL DEFAULT E'',
    "content" TEXT NOT NULL DEFAULT E'',
    "source" TEXT NOT NULL DEFAULT E'',
    "createTime" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "External_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "brief" TEXT NOT NULL DEFAULT E'',
    "heroVideo" INTEGER,
    "heroImage" INTEGER,
    "heroImageSize" TEXT DEFAULT E'normal',
    "og_title" TEXT NOT NULL DEFAULT E'',
    "og_description" TEXT NOT NULL DEFAULT E'',
    "og_image" INTEGER,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "css" TEXT NOT NULL DEFAULT E'',
    "javascript" TEXT NOT NULL DEFAULT E'',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "title" TEXT NOT NULL DEFAULT E'',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "style" TEXT,
    "heroImage" INTEGER,
    "og_title" TEXT NOT NULL DEFAULT E'',
    "og_description" TEXT NOT NULL DEFAULT E'',
    "og_image" INTEGER,
    "css" TEXT NOT NULL DEFAULT E'',
    "javascript" TEXT NOT NULL DEFAULT E'',
    "isCampaign" BOOLEAN NOT NULL DEFAULT false,
    "isMemberOnly" BOOLEAN NOT NULL DEFAULT false,
    "isAudioSiteOnly" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "PostCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "state" TEXT DEFAULT E'draft',
    "publishedDate" TIMESTAMP(3),
    "eventType" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "video" INTEGER,
    "embed" TEXT NOT NULL DEFAULT E'',
    "image" INTEGER,
    "link" TEXT NOT NULL DEFAULT E'',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Partner" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "display" TEXT NOT NULL DEFAULT E'',
    "website" TEXT NOT NULL DEFAULT E'',
    "public" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Partner_pkey" PRIMARY KEY ("id")
);

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
CREATE TABLE "_Post_sections" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Post_categories" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Post_tags" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Post_relateds" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_EditorChoice_choices" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Post_writers" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Post_photographers" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Post_camera_man" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Post_designers" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Post_engineers" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Post_vocals" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Section_topics" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Tag_topics" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Section_categories" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Section_extend_cats" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Event_sections" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");

-- CreateIndex
CREATE INDEX "Post_state_idx" ON "Post"("state");

-- CreateIndex
CREATE INDEX "Post_publishedDate_idx" ON "Post"("publishedDate");

-- CreateIndex
CREATE INDEX "Post_heroVideo_idx" ON "Post"("heroVideo");

-- CreateIndex
CREATE INDEX "Post_heroImage_idx" ON "Post"("heroImage");

-- CreateIndex
CREATE INDEX "Post_style_idx" ON "Post"("style");

-- CreateIndex
CREATE INDEX "Post_topics_idx" ON "Post"("topics");

-- CreateIndex
CREATE INDEX "Post_og_image_idx" ON "Post"("og_image");

-- CreateIndex
CREATE INDEX "Post_device_idx" ON "Post"("device");

-- CreateIndex
CREATE INDEX "Post_createdBy_idx" ON "Post"("createdBy");

-- CreateIndex
CREATE INDEX "Post_updatedBy_idx" ON "Post"("updatedBy");

-- CreateIndex
CREATE INDEX "EditorChoice_state_idx" ON "EditorChoice"("state");

-- CreateIndex
CREATE INDEX "EditorChoice_createdBy_idx" ON "EditorChoice"("createdBy");

-- CreateIndex
CREATE INDEX "EditorChoice_updatedBy_idx" ON "EditorChoice"("updatedBy");

-- CreateIndex
CREATE INDEX "Topic_state_idx" ON "Topic"("state");

-- CreateIndex
CREATE INDEX "Topic_leading_idx" ON "Topic"("leading");

-- CreateIndex
CREATE INDEX "Topic_heroVideo_idx" ON "Topic"("heroVideo");

-- CreateIndex
CREATE INDEX "Topic_heroImage_idx" ON "Topic"("heroImage");

-- CreateIndex
CREATE INDEX "Topic_og_image_idx" ON "Topic"("og_image");

-- CreateIndex
CREATE INDEX "Topic_title_style_idx" ON "Topic"("title_style");

-- CreateIndex
CREATE INDEX "Topic_type_idx" ON "Topic"("type");

-- CreateIndex
CREATE INDEX "Topic_createdBy_idx" ON "Topic"("createdBy");

-- CreateIndex
CREATE INDEX "Topic_updatedBy_idx" ON "Topic"("updatedBy");

-- CreateIndex
CREATE INDEX "Magazine_coverPhoto_idx" ON "Magazine"("coverPhoto");

-- CreateIndex
CREATE INDEX "Magazine_type_idx" ON "Magazine"("type");

-- CreateIndex
CREATE INDEX "Magazine_publishedDate_idx" ON "Magazine"("publishedDate");

-- CreateIndex
CREATE INDEX "Magazine_state_idx" ON "Magazine"("state");

-- CreateIndex
CREATE INDEX "Magazine_createdBy_idx" ON "Magazine"("createdBy");

-- CreateIndex
CREATE INDEX "Magazine_updatedBy_idx" ON "Magazine"("updatedBy");

-- CreateIndex
CREATE INDEX "Image_createdBy_idx" ON "Image"("createdBy");

-- CreateIndex
CREATE INDEX "Image_updatedBy_idx" ON "Image"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "Contact_email_key" ON "Contact"("email");

-- CreateIndex
CREATE INDEX "Contact_name_idx" ON "Contact"("name");

-- CreateIndex
CREATE INDEX "Contact_image_idx" ON "Contact"("image");

-- CreateIndex
CREATE INDEX "Contact_instantgram_idx" ON "Contact"("instantgram");

-- CreateIndex
CREATE INDEX "Contact_createdBy_idx" ON "Contact"("createdBy");

-- CreateIndex
CREATE INDEX "Contact_updatedBy_idx" ON "Contact"("updatedBy");

-- CreateIndex
CREATE INDEX "Video_coverPhoto_idx" ON "Video"("coverPhoto");

-- CreateIndex
CREATE INDEX "Video_createdBy_idx" ON "Video"("createdBy");

-- CreateIndex
CREATE INDEX "Video_updatedBy_idx" ON "Video"("updatedBy");

-- CreateIndex
CREATE INDEX "Section_heroImage_idx" ON "Section"("heroImage");

-- CreateIndex
CREATE INDEX "Section_og_image_idx" ON "Section"("og_image");

-- CreateIndex
CREATE INDEX "Section_createdBy_idx" ON "Section"("createdBy");

-- CreateIndex
CREATE INDEX "Section_updatedBy_idx" ON "Section"("updatedBy");

-- CreateIndex
CREATE INDEX "AudioFile_createdBy_idx" ON "AudioFile"("createdBy");

-- CreateIndex
CREATE INDEX "AudioFile_updatedBy_idx" ON "AudioFile"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "External_name_key" ON "External"("name");

-- CreateIndex
CREATE INDEX "External_partner_idx" ON "External"("partner");

-- CreateIndex
CREATE INDEX "External_state_idx" ON "External"("state");

-- CreateIndex
CREATE INDEX "External_publishedDate_idx" ON "External"("publishedDate");

-- CreateIndex
CREATE INDEX "External_createdBy_idx" ON "External"("createdBy");

-- CreateIndex
CREATE INDEX "External_updatedBy_idx" ON "External"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE INDEX "Tag_heroVideo_idx" ON "Tag"("heroVideo");

-- CreateIndex
CREATE INDEX "Tag_heroImage_idx" ON "Tag"("heroImage");

-- CreateIndex
CREATE INDEX "Tag_og_image_idx" ON "Tag"("og_image");

-- CreateIndex
CREATE INDEX "Tag_createdBy_idx" ON "Tag"("createdBy");

-- CreateIndex
CREATE INDEX "Tag_updatedBy_idx" ON "Tag"("updatedBy");

-- CreateIndex
CREATE INDEX "PostCategory_heroImage_idx" ON "PostCategory"("heroImage");

-- CreateIndex
CREATE INDEX "PostCategory_og_image_idx" ON "PostCategory"("og_image");

-- CreateIndex
CREATE INDEX "PostCategory_createdBy_idx" ON "PostCategory"("createdBy");

-- CreateIndex
CREATE INDEX "PostCategory_updatedBy_idx" ON "PostCategory"("updatedBy");

-- CreateIndex
CREATE INDEX "Event_name_idx" ON "Event"("name");

-- CreateIndex
CREATE INDEX "Event_state_idx" ON "Event"("state");

-- CreateIndex
CREATE INDEX "Event_publishedDate_idx" ON "Event"("publishedDate");

-- CreateIndex
CREATE INDEX "Event_eventType_idx" ON "Event"("eventType");

-- CreateIndex
CREATE INDEX "Event_video_idx" ON "Event"("video");

-- CreateIndex
CREATE INDEX "Event_image_idx" ON "Event"("image");

-- CreateIndex
CREATE INDEX "Event_createdBy_idx" ON "Event"("createdBy");

-- CreateIndex
CREATE INDEX "Event_updatedBy_idx" ON "Event"("updatedBy");

-- CreateIndex
CREATE INDEX "Partner_name_idx" ON "Partner"("name");

-- CreateIndex
CREATE INDEX "Partner_display_idx" ON "Partner"("display");

-- CreateIndex
CREATE INDEX "Partner_website_idx" ON "Partner"("website");

-- CreateIndex
CREATE INDEX "Partner_createdBy_idx" ON "Partner"("createdBy");

-- CreateIndex
CREATE INDEX "Partner_updatedBy_idx" ON "Partner"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_Post_sections_AB_unique" ON "_Post_sections"("A", "B");

-- CreateIndex
CREATE INDEX "_Post_sections_B_index" ON "_Post_sections"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Post_categories_AB_unique" ON "_Post_categories"("A", "B");

-- CreateIndex
CREATE INDEX "_Post_categories_B_index" ON "_Post_categories"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Post_tags_AB_unique" ON "_Post_tags"("A", "B");

-- CreateIndex
CREATE INDEX "_Post_tags_B_index" ON "_Post_tags"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Post_relateds_AB_unique" ON "_Post_relateds"("A", "B");

-- CreateIndex
CREATE INDEX "_Post_relateds_B_index" ON "_Post_relateds"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_EditorChoice_choices_AB_unique" ON "_EditorChoice_choices"("A", "B");

-- CreateIndex
CREATE INDEX "_EditorChoice_choices_B_index" ON "_EditorChoice_choices"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Post_writers_AB_unique" ON "_Post_writers"("A", "B");

-- CreateIndex
CREATE INDEX "_Post_writers_B_index" ON "_Post_writers"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Post_photographers_AB_unique" ON "_Post_photographers"("A", "B");

-- CreateIndex
CREATE INDEX "_Post_photographers_B_index" ON "_Post_photographers"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Post_camera_man_AB_unique" ON "_Post_camera_man"("A", "B");

-- CreateIndex
CREATE INDEX "_Post_camera_man_B_index" ON "_Post_camera_man"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Post_designers_AB_unique" ON "_Post_designers"("A", "B");

-- CreateIndex
CREATE INDEX "_Post_designers_B_index" ON "_Post_designers"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Post_engineers_AB_unique" ON "_Post_engineers"("A", "B");

-- CreateIndex
CREATE INDEX "_Post_engineers_B_index" ON "_Post_engineers"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Post_vocals_AB_unique" ON "_Post_vocals"("A", "B");

-- CreateIndex
CREATE INDEX "_Post_vocals_B_index" ON "_Post_vocals"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Section_topics_AB_unique" ON "_Section_topics"("A", "B");

-- CreateIndex
CREATE INDEX "_Section_topics_B_index" ON "_Section_topics"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Tag_topics_AB_unique" ON "_Tag_topics"("A", "B");

-- CreateIndex
CREATE INDEX "_Tag_topics_B_index" ON "_Tag_topics"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Section_categories_AB_unique" ON "_Section_categories"("A", "B");

-- CreateIndex
CREATE INDEX "_Section_categories_B_index" ON "_Section_categories"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Section_extend_cats_AB_unique" ON "_Section_extend_cats"("A", "B");

-- CreateIndex
CREATE INDEX "_Section_extend_cats_B_index" ON "_Section_extend_cats"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Event_sections_AB_unique" ON "_Event_sections"("A", "B");

-- CreateIndex
CREATE INDEX "_Event_sections_B_index" ON "_Event_sections"("B");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_topics_fkey" FOREIGN KEY ("topics") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_heroImage_fkey" FOREIGN KEY ("heroImage") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_og_image_fkey" FOREIGN KEY ("og_image") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_heroVideo_fkey" FOREIGN KEY ("heroVideo") REFERENCES "Video"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditorChoice" ADD CONSTRAINT "EditorChoice_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditorChoice" ADD CONSTRAINT "EditorChoice_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_heroImage_fkey" FOREIGN KEY ("heroImage") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_og_image_fkey" FOREIGN KEY ("og_image") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_heroVideo_fkey" FOREIGN KEY ("heroVideo") REFERENCES "Video"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Magazine" ADD CONSTRAINT "Magazine_coverPhoto_fkey" FOREIGN KEY ("coverPhoto") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Magazine" ADD CONSTRAINT "Magazine_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Magazine" ADD CONSTRAINT "Magazine_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_image_fkey" FOREIGN KEY ("image") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_coverPhoto_fkey" FOREIGN KEY ("coverPhoto") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_heroImage_fkey" FOREIGN KEY ("heroImage") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_og_image_fkey" FOREIGN KEY ("og_image") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AudioFile" ADD CONSTRAINT "AudioFile_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AudioFile" ADD CONSTRAINT "AudioFile_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "External" ADD CONSTRAINT "External_partner_fkey" FOREIGN KEY ("partner") REFERENCES "Partner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "External" ADD CONSTRAINT "External_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "External" ADD CONSTRAINT "External_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_heroImage_fkey" FOREIGN KEY ("heroImage") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_og_image_fkey" FOREIGN KEY ("og_image") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_heroVideo_fkey" FOREIGN KEY ("heroVideo") REFERENCES "Video"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostCategory" ADD CONSTRAINT "PostCategory_heroImage_fkey" FOREIGN KEY ("heroImage") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostCategory" ADD CONSTRAINT "PostCategory_og_image_fkey" FOREIGN KEY ("og_image") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostCategory" ADD CONSTRAINT "PostCategory_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostCategory" ADD CONSTRAINT "PostCategory_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_image_fkey" FOREIGN KEY ("image") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_video_fkey" FOREIGN KEY ("video") REFERENCES "Video"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Partner" ADD CONSTRAINT "Partner_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Partner" ADD CONSTRAINT "Partner_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_sections" ADD FOREIGN KEY ("A") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_sections" ADD FOREIGN KEY ("B") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_categories" ADD FOREIGN KEY ("A") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_categories" ADD FOREIGN KEY ("B") REFERENCES "PostCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_tags" ADD FOREIGN KEY ("A") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_tags" ADD FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_relateds" ADD FOREIGN KEY ("A") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_relateds" ADD FOREIGN KEY ("B") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EditorChoice_choices" ADD FOREIGN KEY ("A") REFERENCES "EditorChoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EditorChoice_choices" ADD FOREIGN KEY ("B") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_writers" ADD FOREIGN KEY ("A") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_writers" ADD FOREIGN KEY ("B") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_photographers" ADD FOREIGN KEY ("A") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_photographers" ADD FOREIGN KEY ("B") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_camera_man" ADD FOREIGN KEY ("A") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_camera_man" ADD FOREIGN KEY ("B") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_designers" ADD FOREIGN KEY ("A") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_designers" ADD FOREIGN KEY ("B") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_engineers" ADD FOREIGN KEY ("A") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_engineers" ADD FOREIGN KEY ("B") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_vocals" ADD FOREIGN KEY ("A") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_vocals" ADD FOREIGN KEY ("B") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Section_topics" ADD FOREIGN KEY ("A") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Section_topics" ADD FOREIGN KEY ("B") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Tag_topics" ADD FOREIGN KEY ("A") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Tag_topics" ADD FOREIGN KEY ("B") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Section_categories" ADD FOREIGN KEY ("A") REFERENCES "PostCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Section_categories" ADD FOREIGN KEY ("B") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Section_extend_cats" ADD FOREIGN KEY ("A") REFERENCES "PostCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Section_extend_cats" ADD FOREIGN KEY ("B") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Event_sections" ADD FOREIGN KEY ("A") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Event_sections" ADD FOREIGN KEY ("B") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;
