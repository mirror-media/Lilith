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
CREATE TABLE "Post" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL DEFAULT E'',
    "name" TEXT NOT NULL DEFAULT E'',
    "subtitle" TEXT NOT NULL DEFAULT E'',
    "type" TEXT DEFAULT E'article',
    "status" TEXT DEFAULT E'draft',
    "weight" INTEGER DEFAULT 3,
    "heroImage" INTEGER,
    "heroVideo" TEXT NOT NULL DEFAULT E'',
    "heroCaption" TEXT NOT NULL DEFAULT E'',
    "reporter" TEXT NOT NULL DEFAULT E'',
    "author" TEXT NOT NULL DEFAULT E'',
    "photographer" TEXT NOT NULL DEFAULT E'',
    "video" TEXT NOT NULL DEFAULT E'',
    "designer" TEXT NOT NULL DEFAULT E'',
    "engineer" TEXT NOT NULL DEFAULT E'',
    "data" TEXT NOT NULL DEFAULT E'',
    "content" JSONB,
    "publishDate" TIMESTAMP(3) NOT NULL,
    "project" INTEGER,
    "group" INTEGER,
    "category" INTEGER,
    "classify" INTEGER,
    "postPreviewButton" TEXT NOT NULL DEFAULT E'',
    "apiData" JSONB,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "Classify" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "slug" TEXT NOT NULL DEFAULT E'',
    "category" INTEGER,
    "weight" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Classify_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "slug" TEXT NOT NULL DEFAULT E'',
    "weight" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "group" INTEGER,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Group" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "slug" TEXT NOT NULL DEFAULT E'',
    "weight" INTEGER DEFAULT 5,
    "heroImage" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SDG" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "url" TEXT NOT NULL DEFAULT E'',
    "heroImage" INTEGER,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "SDG_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "slug" TEXT NOT NULL DEFAULT E'',
    "weight" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LatestNew" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "slug" TEXT NOT NULL DEFAULT E'',
    "subtitle" TEXT NOT NULL DEFAULT E'',
    "status" TEXT DEFAULT E'published',
    "publishTime" TIMESTAMP(3),
    "type" TEXT DEFAULT E'news',
    "content" JSONB,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "apiData" JSONB,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "LatestNew_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "slug" TEXT NOT NULL DEFAULT E'',
    "weight" INTEGER,
    "register_start" TIMESTAMP(3),
    "register_end" TIMESTAMP(3),
    "category" INTEGER,
    "venue" TEXT NOT NULL DEFAULT E'',
    "content" JSONB,
    "status" TEXT,
    "type" TEXT,
    "register_link" TEXT NOT NULL DEFAULT E'',
    "heroImage" INTEGER,
    "posts" INTEGER,
    "apiData" JSONB,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EditorChoice" (
    "id" SERIAL NOT NULL,
    "post" INTEGER,
    "weight" INTEGER DEFAULT 2,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "EditorChoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromoteStory" (
    "id" SERIAL NOT NULL,
    "post" INTEGER,
    "weight" INTEGER DEFAULT 2,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "PromoteStory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromoteEvent" (
    "id" SERIAL NOT NULL,
    "post" INTEGER,
    "weight" INTEGER DEFAULT 2,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "PromoteEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Influence" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "status" TEXT,
    "heroImage" INTEGER,
    "publishDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Influence_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "Poll" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "image" INTEGER,
    "choice" TEXT,
    "type" TEXT,
    "status" TEXT DEFAULT E'draft',
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "publishTime" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Poll_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PollOption" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "order" INTEGER,
    "poll" INTEGER,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "PollOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PollResult" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "poll" INTEGER,
    "option" INTEGER,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "PollResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Banner" (
    "id" SERIAL NOT NULL,
    "mobileImage" INTEGER,
    "desktopImage" INTEGER,
    "url" TEXT NOT NULL DEFAULT E'',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Banner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Download" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "file_filesize" INTEGER,
    "file_mode" TEXT,
    "file_filename" TEXT,
    "url" TEXT NOT NULL DEFAULT E'',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Download_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InfoGraph" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "slug" TEXT NOT NULL DEFAULT E'',
    "status" TEXT,
    "heroImage" INTEGER,
    "publishDate" TIMESTAMP(3) NOT NULL,
    "infograph" TEXT NOT NULL DEFAULT E'',
    "dataSource" TEXT NOT NULL DEFAULT E'',
    "sourceLink" TEXT NOT NULL DEFAULT E'',
    "content" JSONB,
    "dataUpdated" TIMESTAMP(3) NOT NULL,
    "apiData" JSONB,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "InfoGraph_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_Post_relatedPosts" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Post_sdg" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Post_tags" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Category_sdg" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Download_latest" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Event_hosted_logo" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Download_influence" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");

-- CreateIndex
CREATE INDEX "Post_heroImage_idx" ON "Post"("heroImage");

-- CreateIndex
CREATE INDEX "Post_project_idx" ON "Post"("project");

-- CreateIndex
CREATE INDEX "Post_group_idx" ON "Post"("group");

-- CreateIndex
CREATE INDEX "Post_category_idx" ON "Post"("category");

-- CreateIndex
CREATE INDEX "Post_classify_idx" ON "Post"("classify");

-- CreateIndex
CREATE INDEX "Post_createdBy_idx" ON "Post"("createdBy");

-- CreateIndex
CREATE INDEX "Post_updatedBy_idx" ON "Post"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE INDEX "Tag_createdBy_idx" ON "Tag"("createdBy");

-- CreateIndex
CREATE INDEX "Tag_updatedBy_idx" ON "Tag"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "Classify_slug_key" ON "Classify"("slug");

-- CreateIndex
CREATE INDEX "Classify_category_idx" ON "Classify"("category");

-- CreateIndex
CREATE INDEX "Classify_createdBy_idx" ON "Classify"("createdBy");

-- CreateIndex
CREATE INDEX "Classify_updatedBy_idx" ON "Classify"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Category_group_idx" ON "Category"("group");

-- CreateIndex
CREATE INDEX "Category_createdBy_idx" ON "Category"("createdBy");

-- CreateIndex
CREATE INDEX "Category_updatedBy_idx" ON "Category"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "Group_slug_key" ON "Group"("slug");

-- CreateIndex
CREATE INDEX "Group_heroImage_idx" ON "Group"("heroImage");

-- CreateIndex
CREATE INDEX "Group_createdBy_idx" ON "Group"("createdBy");

-- CreateIndex
CREATE INDEX "Group_updatedBy_idx" ON "Group"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "SDG_url_key" ON "SDG"("url");

-- CreateIndex
CREATE INDEX "SDG_heroImage_idx" ON "SDG"("heroImage");

-- CreateIndex
CREATE INDEX "SDG_createdBy_idx" ON "SDG"("createdBy");

-- CreateIndex
CREATE INDEX "SDG_updatedBy_idx" ON "SDG"("updatedBy");

-- CreateIndex
CREATE INDEX "Project_createdBy_idx" ON "Project"("createdBy");

-- CreateIndex
CREATE INDEX "Project_updatedBy_idx" ON "Project"("updatedBy");

-- CreateIndex
CREATE INDEX "LatestNew_createdBy_idx" ON "LatestNew"("createdBy");

-- CreateIndex
CREATE INDEX "LatestNew_updatedBy_idx" ON "LatestNew"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "Event_posts_key" ON "Event"("posts");

-- CreateIndex
CREATE INDEX "Event_category_idx" ON "Event"("category");

-- CreateIndex
CREATE INDEX "Event_heroImage_idx" ON "Event"("heroImage");

-- CreateIndex
CREATE INDEX "Event_createdBy_idx" ON "Event"("createdBy");

-- CreateIndex
CREATE INDEX "Event_updatedBy_idx" ON "Event"("updatedBy");

-- CreateIndex
CREATE INDEX "EditorChoice_post_idx" ON "EditorChoice"("post");

-- CreateIndex
CREATE INDEX "EditorChoice_createdBy_idx" ON "EditorChoice"("createdBy");

-- CreateIndex
CREATE INDEX "EditorChoice_updatedBy_idx" ON "EditorChoice"("updatedBy");

-- CreateIndex
CREATE INDEX "PromoteStory_post_idx" ON "PromoteStory"("post");

-- CreateIndex
CREATE INDEX "PromoteStory_createdBy_idx" ON "PromoteStory"("createdBy");

-- CreateIndex
CREATE INDEX "PromoteStory_updatedBy_idx" ON "PromoteStory"("updatedBy");

-- CreateIndex
CREATE INDEX "PromoteEvent_post_idx" ON "PromoteEvent"("post");

-- CreateIndex
CREATE INDEX "PromoteEvent_createdBy_idx" ON "PromoteEvent"("createdBy");

-- CreateIndex
CREATE INDEX "PromoteEvent_updatedBy_idx" ON "PromoteEvent"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "Influence_name_key" ON "Influence"("name");

-- CreateIndex
CREATE INDEX "Influence_heroImage_idx" ON "Influence"("heroImage");

-- CreateIndex
CREATE INDEX "Influence_createdBy_idx" ON "Influence"("createdBy");

-- CreateIndex
CREATE INDEX "Influence_updatedBy_idx" ON "Influence"("updatedBy");

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
CREATE UNIQUE INDEX "Poll_name_key" ON "Poll"("name");

-- CreateIndex
CREATE INDEX "Poll_image_idx" ON "Poll"("image");

-- CreateIndex
CREATE INDEX "Poll_createdBy_idx" ON "Poll"("createdBy");

-- CreateIndex
CREATE INDEX "Poll_updatedBy_idx" ON "Poll"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "PollOption_name_key" ON "PollOption"("name");

-- CreateIndex
CREATE INDEX "PollOption_poll_idx" ON "PollOption"("poll");

-- CreateIndex
CREATE INDEX "PollOption_createdBy_idx" ON "PollOption"("createdBy");

-- CreateIndex
CREATE INDEX "PollOption_updatedBy_idx" ON "PollOption"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "PollResult_name_key" ON "PollResult"("name");

-- CreateIndex
CREATE INDEX "PollResult_poll_idx" ON "PollResult"("poll");

-- CreateIndex
CREATE INDEX "PollResult_option_idx" ON "PollResult"("option");

-- CreateIndex
CREATE INDEX "PollResult_createdBy_idx" ON "PollResult"("createdBy");

-- CreateIndex
CREATE INDEX "PollResult_updatedBy_idx" ON "PollResult"("updatedBy");

-- CreateIndex
CREATE INDEX "Banner_mobileImage_idx" ON "Banner"("mobileImage");

-- CreateIndex
CREATE INDEX "Banner_desktopImage_idx" ON "Banner"("desktopImage");

-- CreateIndex
CREATE INDEX "Banner_createdBy_idx" ON "Banner"("createdBy");

-- CreateIndex
CREATE INDEX "Banner_updatedBy_idx" ON "Banner"("updatedBy");

-- CreateIndex
CREATE INDEX "Download_createdBy_idx" ON "Download"("createdBy");

-- CreateIndex
CREATE INDEX "Download_updatedBy_idx" ON "Download"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "InfoGraph_name_key" ON "InfoGraph"("name");

-- CreateIndex
CREATE UNIQUE INDEX "InfoGraph_slug_key" ON "InfoGraph"("slug");

-- CreateIndex
CREATE INDEX "InfoGraph_heroImage_idx" ON "InfoGraph"("heroImage");

-- CreateIndex
CREATE INDEX "InfoGraph_createdBy_idx" ON "InfoGraph"("createdBy");

-- CreateIndex
CREATE INDEX "InfoGraph_updatedBy_idx" ON "InfoGraph"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "_Post_relatedPosts_AB_unique" ON "_Post_relatedPosts"("A", "B");

-- CreateIndex
CREATE INDEX "_Post_relatedPosts_B_index" ON "_Post_relatedPosts"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Post_sdg_AB_unique" ON "_Post_sdg"("A", "B");

-- CreateIndex
CREATE INDEX "_Post_sdg_B_index" ON "_Post_sdg"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Post_tags_AB_unique" ON "_Post_tags"("A", "B");

-- CreateIndex
CREATE INDEX "_Post_tags_B_index" ON "_Post_tags"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Category_sdg_AB_unique" ON "_Category_sdg"("A", "B");

-- CreateIndex
CREATE INDEX "_Category_sdg_B_index" ON "_Category_sdg"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Download_latest_AB_unique" ON "_Download_latest"("A", "B");

-- CreateIndex
CREATE INDEX "_Download_latest_B_index" ON "_Download_latest"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Event_hosted_logo_AB_unique" ON "_Event_hosted_logo"("A", "B");

-- CreateIndex
CREATE INDEX "_Event_hosted_logo_B_index" ON "_Event_hosted_logo"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Download_influence_AB_unique" ON "_Download_influence"("A", "B");

-- CreateIndex
CREATE INDEX "_Download_influence_B_index" ON "_Download_influence"("B");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_heroImage_fkey" FOREIGN KEY ("heroImage") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_project_fkey" FOREIGN KEY ("project") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_group_fkey" FOREIGN KEY ("group") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_category_fkey" FOREIGN KEY ("category") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_classify_fkey" FOREIGN KEY ("classify") REFERENCES "Classify"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Classify" ADD CONSTRAINT "Classify_category_fkey" FOREIGN KEY ("category") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Classify" ADD CONSTRAINT "Classify_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Classify" ADD CONSTRAINT "Classify_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_group_fkey" FOREIGN KEY ("group") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_heroImage_fkey" FOREIGN KEY ("heroImage") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SDG" ADD CONSTRAINT "SDG_heroImage_fkey" FOREIGN KEY ("heroImage") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SDG" ADD CONSTRAINT "SDG_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SDG" ADD CONSTRAINT "SDG_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LatestNew" ADD CONSTRAINT "LatestNew_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LatestNew" ADD CONSTRAINT "LatestNew_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_category_fkey" FOREIGN KEY ("category") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_heroImage_fkey" FOREIGN KEY ("heroImage") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_posts_fkey" FOREIGN KEY ("posts") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditorChoice" ADD CONSTRAINT "EditorChoice_post_fkey" FOREIGN KEY ("post") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditorChoice" ADD CONSTRAINT "EditorChoice_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditorChoice" ADD CONSTRAINT "EditorChoice_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromoteStory" ADD CONSTRAINT "PromoteStory_post_fkey" FOREIGN KEY ("post") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromoteStory" ADD CONSTRAINT "PromoteStory_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromoteStory" ADD CONSTRAINT "PromoteStory_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromoteEvent" ADD CONSTRAINT "PromoteEvent_post_fkey" FOREIGN KEY ("post") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromoteEvent" ADD CONSTRAINT "PromoteEvent_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromoteEvent" ADD CONSTRAINT "PromoteEvent_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Influence" ADD CONSTRAINT "Influence_heroImage_fkey" FOREIGN KEY ("heroImage") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Influence" ADD CONSTRAINT "Influence_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Influence" ADD CONSTRAINT "Influence_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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
ALTER TABLE "Poll" ADD CONSTRAINT "Poll_image_fkey" FOREIGN KEY ("image") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Poll" ADD CONSTRAINT "Poll_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Poll" ADD CONSTRAINT "Poll_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PollOption" ADD CONSTRAINT "PollOption_poll_fkey" FOREIGN KEY ("poll") REFERENCES "Poll"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PollOption" ADD CONSTRAINT "PollOption_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PollOption" ADD CONSTRAINT "PollOption_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PollResult" ADD CONSTRAINT "PollResult_poll_fkey" FOREIGN KEY ("poll") REFERENCES "Poll"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PollResult" ADD CONSTRAINT "PollResult_option_fkey" FOREIGN KEY ("option") REFERENCES "PollOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PollResult" ADD CONSTRAINT "PollResult_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PollResult" ADD CONSTRAINT "PollResult_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Banner" ADD CONSTRAINT "Banner_mobileImage_fkey" FOREIGN KEY ("mobileImage") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Banner" ADD CONSTRAINT "Banner_desktopImage_fkey" FOREIGN KEY ("desktopImage") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Banner" ADD CONSTRAINT "Banner_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Banner" ADD CONSTRAINT "Banner_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Download" ADD CONSTRAINT "Download_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Download" ADD CONSTRAINT "Download_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InfoGraph" ADD CONSTRAINT "InfoGraph_heroImage_fkey" FOREIGN KEY ("heroImage") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InfoGraph" ADD CONSTRAINT "InfoGraph_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InfoGraph" ADD CONSTRAINT "InfoGraph_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_relatedPosts" ADD FOREIGN KEY ("A") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_relatedPosts" ADD FOREIGN KEY ("B") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_sdg" ADD FOREIGN KEY ("A") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_sdg" ADD FOREIGN KEY ("B") REFERENCES "SDG"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_tags" ADD FOREIGN KEY ("A") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_tags" ADD FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Category_sdg" ADD FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Category_sdg" ADD FOREIGN KEY ("B") REFERENCES "SDG"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Download_latest" ADD FOREIGN KEY ("A") REFERENCES "Download"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Download_latest" ADD FOREIGN KEY ("B") REFERENCES "LatestNew"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Event_hosted_logo" ADD FOREIGN KEY ("A") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Event_hosted_logo" ADD FOREIGN KEY ("B") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Download_influence" ADD FOREIGN KEY ("A") REFERENCES "Download"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Download_influence" ADD FOREIGN KEY ("B") REFERENCES "Influence"("id") ON DELETE CASCADE ON UPDATE CASCADE;
