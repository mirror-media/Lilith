-- CreateTable
CREATE TABLE "AudioFile" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "file_filesize" INTEGER,
    "file_filename" TEXT,
    "urlOriginal" TEXT NOT NULL DEFAULT '',
    "heroImage" INTEGER,
    "content" JSONB,
    "apiData" JSONB,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "AudioFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "slug" TEXT NOT NULL DEFAULT '',
    "order" INTEGER,
    "state" TEXT NOT NULL DEFAULT 'active',
    "heroImage" INTEGER,
    "isMemberOnly" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "content" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EditorChoice" (
    "id" SERIAL NOT NULL,
    "order" INTEGER,
    "outlink" TEXT NOT NULL DEFAULT '',
    "choices" INTEGER,
    "state" TEXT DEFAULT 'draft',
    "publishedDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "EditorChoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "External" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL DEFAULT '',
    "partner" INTEGER,
    "title" TEXT NOT NULL DEFAULT '',
    "state" TEXT DEFAULT 'draft',
    "publishedDate" TIMESTAMP(3),
    "publishedDateString" TEXT NOT NULL DEFAULT '',
    "extend_byline" TEXT NOT NULL DEFAULT '',
    "thumb" TEXT NOT NULL DEFAULT '',
    "brief" TEXT NOT NULL DEFAULT '',
    "content" TEXT NOT NULL DEFAULT '',
    "source" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "External_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Header" (
    "id" SERIAL NOT NULL,
    "order" INTEGER,
    "section" INTEGER,
    "category" INTEGER,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Header_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Partner" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL DEFAULT '',
    "website" TEXT NOT NULL DEFAULT '',
    "public" BOOLEAN NOT NULL DEFAULT true,
    "showOnIndex" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Partner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Image" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "imageFile_filesize" INTEGER,
    "imageFile_extension" TEXT,
    "imageFile_width" INTEGER,
    "imageFile_height" INTEGER,
    "imageFile_id" TEXT,
    "waterMark" BOOLEAN NOT NULL DEFAULT false,
    "file_filesize" INTEGER,
    "file_filename" TEXT,
    "topicKeywords" TEXT NOT NULL DEFAULT '',
    "copyRight" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" SERIAL NOT NULL,
    "lockBy" INTEGER,
    "lockExpireAt" TIMESTAMP(3),
    "slug" TEXT NOT NULL DEFAULT '',
    "title" TEXT NOT NULL DEFAULT '',
    "subtitle" TEXT NOT NULL DEFAULT '',
    "state" TEXT DEFAULT 'draft',
    "publishedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedDateString" TEXT NOT NULL DEFAULT '',
    "updateTimeStamp" BOOLEAN NOT NULL DEFAULT false,
    "manualOrderOfSections" JSONB,
    "manualOrderOfCategories" JSONB,
    "manualOrderOfWriters" JSONB,
    "extend_byline" TEXT NOT NULL DEFAULT '',
    "heroVideo" INTEGER,
    "heroImage" INTEGER,
    "heroCaption" TEXT NOT NULL DEFAULT '',
    "style" TEXT DEFAULT 'article',
    "brief" JSONB,
    "content" JSONB,
    "isMember" BOOLEAN NOT NULL DEFAULT false,
    "topics" INTEGER,
    "manualOrderOfRelateds" JSONB,
    "og_title" TEXT NOT NULL DEFAULT '',
    "og_description" TEXT NOT NULL DEFAULT '',
    "og_image" INTEGER,
    "manualOrderOfRelatedVideos" JSONB,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isAdvertised" BOOLEAN NOT NULL DEFAULT false,
    "hiddenAdvertised" BOOLEAN NOT NULL DEFAULT false,
    "isAdult" BOOLEAN NOT NULL DEFAULT false,
    "redirect" TEXT NOT NULL DEFAULT '',
    "adTrace" TEXT NOT NULL DEFAULT '',
    "css" TEXT NOT NULL DEFAULT '',
    "apiDataBrief" JSONB,
    "apiData" JSONB,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Section" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "slug" TEXT NOT NULL DEFAULT '',
    "order" INTEGER,
    "state" TEXT NOT NULL DEFAULT 'active',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "heroImage" INTEGER,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "slug" TEXT NOT NULL DEFAULT '',
    "sortOrder" INTEGER,
    "state" TEXT DEFAULT 'draft',
    "brief" JSONB,
    "heroImage" INTEGER,
    "heroUrl" TEXT,
    "leading" TEXT,
    "og_title" TEXT NOT NULL DEFAULT '',
    "og_description" TEXT NOT NULL DEFAULT '',
    "og_image" INTEGER,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "title_style" TEXT DEFAULT 'feature',
    "type" TEXT DEFAULT 'list',
    "style" TEXT NOT NULL DEFAULT '',
    "manualOrderOfSlideshowImages" JSONB,
    "javascript" TEXT NOT NULL DEFAULT '',
    "dfp" TEXT NOT NULL DEFAULT '',
    "mobile_dfp" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

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
CREATE TABLE "Video" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "file_filesize" INTEGER,
    "file_filename" TEXT,
    "urlOriginal" TEXT NOT NULL DEFAULT '',
    "content" JSONB,
    "heroImage" INTEGER,
    "isFeed" BOOLEAN NOT NULL DEFAULT false,
    "manualOrderOfRelatedPosts" JSONB,
    "videoSection" TEXT DEFAULT 'news',
    "state" TEXT DEFAULT 'draft',
    "publishedDate" TIMESTAMP(3),
    "apiData" JSONB,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Group" (
    "id" SERIAL NOT NULL,
    "keyword" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "state" TEXT DEFAULT 'draft',
    "publishedDate" TIMESTAMP(3),
    "heroImage" INTEGER,
    "link" TEXT NOT NULL DEFAULT '',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AudioFile_tags" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Category_sections" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Category_posts" (
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
CREATE TABLE "_External_tags" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_External_relateds" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_External_groups" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Topic_slideshow_images" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Post_sections" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Post_tags" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Post_tags_algo" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Post_related_videos" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Post_relateds" (
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
CREATE TABLE "_Video_tags" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Group_posts" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE INDEX "AudioFile_heroImage_idx" ON "AudioFile"("heroImage");

-- CreateIndex
CREATE INDEX "AudioFile_createdBy_idx" ON "AudioFile"("createdBy");

-- CreateIndex
CREATE INDEX "AudioFile_updatedBy_idx" ON "AudioFile"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Category_state_idx" ON "Category"("state");

-- CreateIndex
CREATE INDEX "Category_heroImage_idx" ON "Category"("heroImage");

-- CreateIndex
CREATE INDEX "Category_createdBy_idx" ON "Category"("createdBy");

-- CreateIndex
CREATE INDEX "Category_updatedBy_idx" ON "Category"("updatedBy");

-- CreateIndex
CREATE INDEX "Contact_name_idx" ON "Contact"("name");

-- CreateIndex
CREATE INDEX "Contact_createdBy_idx" ON "Contact"("createdBy");

-- CreateIndex
CREATE INDEX "Contact_updatedBy_idx" ON "Contact"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "EditorChoice_order_key" ON "EditorChoice"("order");

-- CreateIndex
CREATE INDEX "EditorChoice_choices_idx" ON "EditorChoice"("choices");

-- CreateIndex
CREATE INDEX "EditorChoice_state_idx" ON "EditorChoice"("state");

-- CreateIndex
CREATE INDEX "EditorChoice_publishedDate_idx" ON "EditorChoice"("publishedDate");

-- CreateIndex
CREATE INDEX "EditorChoice_createdBy_idx" ON "EditorChoice"("createdBy");

-- CreateIndex
CREATE INDEX "EditorChoice_updatedBy_idx" ON "EditorChoice"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "External_slug_key" ON "External"("slug");

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
CREATE UNIQUE INDEX "Header_order_key" ON "Header"("order");

-- CreateIndex
CREATE INDEX "Header_section_idx" ON "Header"("section");

-- CreateIndex
CREATE INDEX "Header_category_idx" ON "Header"("category");

-- CreateIndex
CREATE INDEX "Header_createdBy_idx" ON "Header"("createdBy");

-- CreateIndex
CREATE INDEX "Header_updatedBy_idx" ON "Header"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "Partner_slug_key" ON "Partner"("slug");

-- CreateIndex
CREATE INDEX "Partner_name_idx" ON "Partner"("name");

-- CreateIndex
CREATE INDEX "Partner_website_idx" ON "Partner"("website");

-- CreateIndex
CREATE INDEX "Partner_createdBy_idx" ON "Partner"("createdBy");

-- CreateIndex
CREATE INDEX "Partner_updatedBy_idx" ON "Partner"("updatedBy");

-- CreateIndex
CREATE INDEX "Image_createdBy_idx" ON "Image"("createdBy");

-- CreateIndex
CREATE INDEX "Image_updatedBy_idx" ON "Image"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");

-- CreateIndex
CREATE INDEX "Post_lockBy_idx" ON "Post"("lockBy");

-- CreateIndex
CREATE INDEX "Post_lockExpireAt_idx" ON "Post"("lockExpireAt");

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
CREATE INDEX "Post_createdBy_idx" ON "Post"("createdBy");

-- CreateIndex
CREATE INDEX "Post_updatedBy_idx" ON "Post"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "Section_name_key" ON "Section"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Section_slug_key" ON "Section"("slug");

-- CreateIndex
CREATE INDEX "Section_state_idx" ON "Section"("state");

-- CreateIndex
CREATE INDEX "Section_heroImage_idx" ON "Section"("heroImage");

-- CreateIndex
CREATE INDEX "Section_createdBy_idx" ON "Section"("createdBy");

-- CreateIndex
CREATE INDEX "Section_updatedBy_idx" ON "Section"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_slug_key" ON "Tag"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE INDEX "Tag_createdBy_idx" ON "Tag"("createdBy");

-- CreateIndex
CREATE INDEX "Tag_updatedBy_idx" ON "Tag"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_name_key" ON "Topic"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_slug_key" ON "Topic"("slug");

-- CreateIndex
CREATE INDEX "Topic_state_idx" ON "Topic"("state");

-- CreateIndex
CREATE INDEX "Topic_heroImage_idx" ON "Topic"("heroImage");

-- CreateIndex
CREATE INDEX "Topic_leading_idx" ON "Topic"("leading");

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
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Video_heroImage_idx" ON "Video"("heroImage");

-- CreateIndex
CREATE INDEX "Video_videoSection_idx" ON "Video"("videoSection");

-- CreateIndex
CREATE INDEX "Video_state_idx" ON "Video"("state");

-- CreateIndex
CREATE INDEX "Video_publishedDate_idx" ON "Video"("publishedDate");

-- CreateIndex
CREATE INDEX "Video_createdBy_idx" ON "Video"("createdBy");

-- CreateIndex
CREATE INDEX "Video_updatedBy_idx" ON "Video"("updatedBy");

-- CreateIndex
CREATE INDEX "Group_createdBy_idx" ON "Group"("createdBy");

-- CreateIndex
CREATE INDEX "Group_updatedBy_idx" ON "Group"("updatedBy");

-- CreateIndex
CREATE INDEX "Game_name_idx" ON "Game"("name");

-- CreateIndex
CREATE INDEX "Game_state_idx" ON "Game"("state");

-- CreateIndex
CREATE INDEX "Game_publishedDate_idx" ON "Game"("publishedDate");

-- CreateIndex
CREATE INDEX "Game_heroImage_idx" ON "Game"("heroImage");

-- CreateIndex
CREATE INDEX "Game_createdBy_idx" ON "Game"("createdBy");

-- CreateIndex
CREATE INDEX "Game_updatedBy_idx" ON "Game"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "_AudioFile_tags_AB_unique" ON "_AudioFile_tags"("A", "B");

-- CreateIndex
CREATE INDEX "_AudioFile_tags_B_index" ON "_AudioFile_tags"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Category_sections_AB_unique" ON "_Category_sections"("A", "B");

-- CreateIndex
CREATE INDEX "_Category_sections_B_index" ON "_Category_sections"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Category_posts_AB_unique" ON "_Category_posts"("A", "B");

-- CreateIndex
CREATE INDEX "_Category_posts_B_index" ON "_Category_posts"("B");

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
CREATE UNIQUE INDEX "_External_tags_AB_unique" ON "_External_tags"("A", "B");

-- CreateIndex
CREATE INDEX "_External_tags_B_index" ON "_External_tags"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_External_relateds_AB_unique" ON "_External_relateds"("A", "B");

-- CreateIndex
CREATE INDEX "_External_relateds_B_index" ON "_External_relateds"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_External_groups_AB_unique" ON "_External_groups"("A", "B");

-- CreateIndex
CREATE INDEX "_External_groups_B_index" ON "_External_groups"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Topic_slideshow_images_AB_unique" ON "_Topic_slideshow_images"("A", "B");

-- CreateIndex
CREATE INDEX "_Topic_slideshow_images_B_index" ON "_Topic_slideshow_images"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Post_sections_AB_unique" ON "_Post_sections"("A", "B");

-- CreateIndex
CREATE INDEX "_Post_sections_B_index" ON "_Post_sections"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Post_tags_AB_unique" ON "_Post_tags"("A", "B");

-- CreateIndex
CREATE INDEX "_Post_tags_B_index" ON "_Post_tags"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Post_tags_algo_AB_unique" ON "_Post_tags_algo"("A", "B");

-- CreateIndex
CREATE INDEX "_Post_tags_algo_B_index" ON "_Post_tags_algo"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Post_related_videos_AB_unique" ON "_Post_related_videos"("A", "B");

-- CreateIndex
CREATE INDEX "_Post_related_videos_B_index" ON "_Post_related_videos"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Post_relateds_AB_unique" ON "_Post_relateds"("A", "B");

-- CreateIndex
CREATE INDEX "_Post_relateds_B_index" ON "_Post_relateds"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Section_topics_AB_unique" ON "_Section_topics"("A", "B");

-- CreateIndex
CREATE INDEX "_Section_topics_B_index" ON "_Section_topics"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Tag_topics_AB_unique" ON "_Tag_topics"("A", "B");

-- CreateIndex
CREATE INDEX "_Tag_topics_B_index" ON "_Tag_topics"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Video_tags_AB_unique" ON "_Video_tags"("A", "B");

-- CreateIndex
CREATE INDEX "_Video_tags_B_index" ON "_Video_tags"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Group_posts_AB_unique" ON "_Group_posts"("A", "B");

-- CreateIndex
CREATE INDEX "_Group_posts_B_index" ON "_Group_posts"("B");

-- AddForeignKey
ALTER TABLE "AudioFile" ADD CONSTRAINT "AudioFile_heroImage_fkey" FOREIGN KEY ("heroImage") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AudioFile" ADD CONSTRAINT "AudioFile_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AudioFile" ADD CONSTRAINT "AudioFile_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_heroImage_fkey" FOREIGN KEY ("heroImage") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditorChoice" ADD CONSTRAINT "EditorChoice_choices_fkey" FOREIGN KEY ("choices") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditorChoice" ADD CONSTRAINT "EditorChoice_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditorChoice" ADD CONSTRAINT "EditorChoice_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "External" ADD CONSTRAINT "External_partner_fkey" FOREIGN KEY ("partner") REFERENCES "Partner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "External" ADD CONSTRAINT "External_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "External" ADD CONSTRAINT "External_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Header" ADD CONSTRAINT "Header_section_fkey" FOREIGN KEY ("section") REFERENCES "Section"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Header" ADD CONSTRAINT "Header_category_fkey" FOREIGN KEY ("category") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Header" ADD CONSTRAINT "Header_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Header" ADD CONSTRAINT "Header_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Partner" ADD CONSTRAINT "Partner_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Partner" ADD CONSTRAINT "Partner_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_lockBy_fkey" FOREIGN KEY ("lockBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_heroVideo_fkey" FOREIGN KEY ("heroVideo") REFERENCES "Video"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_heroImage_fkey" FOREIGN KEY ("heroImage") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_topics_fkey" FOREIGN KEY ("topics") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_og_image_fkey" FOREIGN KEY ("og_image") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_heroImage_fkey" FOREIGN KEY ("heroImage") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_heroImage_fkey" FOREIGN KEY ("heroImage") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_og_image_fkey" FOREIGN KEY ("og_image") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_heroImage_fkey" FOREIGN KEY ("heroImage") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_heroImage_fkey" FOREIGN KEY ("heroImage") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AudioFile_tags" ADD CONSTRAINT "_AudioFile_tags_A_fkey" FOREIGN KEY ("A") REFERENCES "AudioFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AudioFile_tags" ADD CONSTRAINT "_AudioFile_tags_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Category_sections" ADD CONSTRAINT "_Category_sections_A_fkey" FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Category_sections" ADD CONSTRAINT "_Category_sections_B_fkey" FOREIGN KEY ("B") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Category_posts" ADD CONSTRAINT "_Category_posts_A_fkey" FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Category_posts" ADD CONSTRAINT "_Category_posts_B_fkey" FOREIGN KEY ("B") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_writers" ADD CONSTRAINT "_Post_writers_A_fkey" FOREIGN KEY ("A") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_writers" ADD CONSTRAINT "_Post_writers_B_fkey" FOREIGN KEY ("B") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_photographers" ADD CONSTRAINT "_Post_photographers_A_fkey" FOREIGN KEY ("A") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_photographers" ADD CONSTRAINT "_Post_photographers_B_fkey" FOREIGN KEY ("B") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_camera_man" ADD CONSTRAINT "_Post_camera_man_A_fkey" FOREIGN KEY ("A") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_camera_man" ADD CONSTRAINT "_Post_camera_man_B_fkey" FOREIGN KEY ("B") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_designers" ADD CONSTRAINT "_Post_designers_A_fkey" FOREIGN KEY ("A") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_designers" ADD CONSTRAINT "_Post_designers_B_fkey" FOREIGN KEY ("B") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_engineers" ADD CONSTRAINT "_Post_engineers_A_fkey" FOREIGN KEY ("A") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_engineers" ADD CONSTRAINT "_Post_engineers_B_fkey" FOREIGN KEY ("B") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_vocals" ADD CONSTRAINT "_Post_vocals_A_fkey" FOREIGN KEY ("A") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_vocals" ADD CONSTRAINT "_Post_vocals_B_fkey" FOREIGN KEY ("B") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_External_tags" ADD CONSTRAINT "_External_tags_A_fkey" FOREIGN KEY ("A") REFERENCES "External"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_External_tags" ADD CONSTRAINT "_External_tags_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_External_relateds" ADD CONSTRAINT "_External_relateds_A_fkey" FOREIGN KEY ("A") REFERENCES "External"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_External_relateds" ADD CONSTRAINT "_External_relateds_B_fkey" FOREIGN KEY ("B") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_External_groups" ADD CONSTRAINT "_External_groups_A_fkey" FOREIGN KEY ("A") REFERENCES "External"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_External_groups" ADD CONSTRAINT "_External_groups_B_fkey" FOREIGN KEY ("B") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Topic_slideshow_images" ADD CONSTRAINT "_Topic_slideshow_images_A_fkey" FOREIGN KEY ("A") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Topic_slideshow_images" ADD CONSTRAINT "_Topic_slideshow_images_B_fkey" FOREIGN KEY ("B") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_sections" ADD CONSTRAINT "_Post_sections_A_fkey" FOREIGN KEY ("A") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_sections" ADD CONSTRAINT "_Post_sections_B_fkey" FOREIGN KEY ("B") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_tags" ADD CONSTRAINT "_Post_tags_A_fkey" FOREIGN KEY ("A") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_tags" ADD CONSTRAINT "_Post_tags_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_tags_algo" ADD CONSTRAINT "_Post_tags_algo_A_fkey" FOREIGN KEY ("A") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_tags_algo" ADD CONSTRAINT "_Post_tags_algo_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_related_videos" ADD CONSTRAINT "_Post_related_videos_A_fkey" FOREIGN KEY ("A") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_related_videos" ADD CONSTRAINT "_Post_related_videos_B_fkey" FOREIGN KEY ("B") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_relateds" ADD CONSTRAINT "_Post_relateds_A_fkey" FOREIGN KEY ("A") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_relateds" ADD CONSTRAINT "_Post_relateds_B_fkey" FOREIGN KEY ("B") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Section_topics" ADD CONSTRAINT "_Section_topics_A_fkey" FOREIGN KEY ("A") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Section_topics" ADD CONSTRAINT "_Section_topics_B_fkey" FOREIGN KEY ("B") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Tag_topics" ADD CONSTRAINT "_Tag_topics_A_fkey" FOREIGN KEY ("A") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Tag_topics" ADD CONSTRAINT "_Tag_topics_B_fkey" FOREIGN KEY ("B") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Video_tags" ADD CONSTRAINT "_Video_tags_A_fkey" FOREIGN KEY ("A") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Video_tags" ADD CONSTRAINT "_Video_tags_B_fkey" FOREIGN KEY ("B") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Group_posts" ADD CONSTRAINT "_Group_posts_A_fkey" FOREIGN KEY ("A") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Group_posts" ADD CONSTRAINT "_Group_posts_B_fkey" FOREIGN KEY ("B") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
