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
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL DEFAULT E'',
    "slug" TEXT NOT NULL DEFAULT E'',
    "summary" TEXT NOT NULL DEFAULT E'',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" SERIAL NOT NULL,
    "member" INTEGER,
    "story" INTEGER,
    "content" TEXT NOT NULL DEFAULT E'',
    "parent" INTEGER,
    "root" INTEGER,
    "state" TEXT DEFAULT E'public',
    "published_date" TIMESTAMP(3),
    "is_edited" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pick" (
    "id" SERIAL NOT NULL,
    "member" INTEGER,
    "objective" TEXT,
    "story" INTEGER,
    "collection" INTEGER,
    "comment" INTEGER,
    "kind" TEXT DEFAULT E'read',
    "state" TEXT DEFAULT E'public',
    "picked_date" TIMESTAMP(3),
    "paywall" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Pick_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Publisher" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL DEFAULT E'',
    "official_site" TEXT NOT NULL DEFAULT E'',
    "rss" TEXT NOT NULL DEFAULT E'',
    "summary" TEXT NOT NULL DEFAULT E'',
    "logo" TEXT NOT NULL DEFAULT E'',
    "description" TEXT NOT NULL DEFAULT E'',
    "customId" TEXT NOT NULL DEFAULT E'',
    "lang" TEXT DEFAULT E'zh-TW',
    "full_content" BOOLEAN NOT NULL DEFAULT false,
    "full_screen_ad" TEXT DEFAULT E'none',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Publisher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Collection" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL DEFAULT E'',
    "slug" TEXT NOT NULL DEFAULT E'',
    "summary" TEXT NOT NULL DEFAULT E'',
    "public" TEXT,
    "format" TEXT,
    "creator" INTEGER,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Collection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollectionMember" (
    "id" SERIAL NOT NULL,
    "member" INTEGER,
    "collection" INTEGER,
    "added_by" INTEGER,
    "updated_by" INTEGER,
    "role" TEXT,
    "added_date" TIMESTAMP(3),
    "updated_date" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "CollectionMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvitationCode" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL DEFAULT E'',
    "send" INTEGER,
    "receive" INTEGER,
    "expired" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "InvitationCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Story" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL DEFAULT E'',
    "url" TEXT NOT NULL DEFAULT E'',
    "summary" TEXT NOT NULL DEFAULT E'',
    "content" TEXT NOT NULL DEFAULT E'',
    "writer" TEXT NOT NULL DEFAULT E'',
    "source" INTEGER,
    "author" INTEGER,
    "category" INTEGER,
    "published_date" TIMESTAMP(3),
    "og_title" TEXT NOT NULL DEFAULT E'',
    "og_image" TEXT NOT NULL DEFAULT E'',
    "og_description" TEXT NOT NULL DEFAULT E'',
    "full_content" BOOLEAN NOT NULL DEFAULT false,
    "paywall" BOOLEAN NOT NULL DEFAULT false,
    "full_screen_ad" TEXT DEFAULT E'none',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Story_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "Member" (
    "id" SERIAL NOT NULL,
    "firebaseId" TEXT NOT NULL DEFAULT E'',
    "customId" TEXT NOT NULL DEFAULT E'',
    "name" TEXT NOT NULL DEFAULT E'',
    "nickname" TEXT NOT NULL DEFAULT E'',
    "avatar" TEXT NOT NULL DEFAULT E'',
    "intro" TEXT NOT NULL DEFAULT E'',
    "email" TEXT NOT NULL DEFAULT E'',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_Member_following_category" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Comment_like" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Pick_pick_comment" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Collection_comment" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Member_comment" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Tag_pick" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Member_follow_publisher" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Member_following_collection" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Member_follower" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Category_createdBy_idx" ON "Category"("createdBy");

-- CreateIndex
CREATE INDEX "Category_updatedBy_idx" ON "Category"("updatedBy");

-- CreateIndex
CREATE INDEX "Comment_member_idx" ON "Comment"("member");

-- CreateIndex
CREATE INDEX "Comment_story_idx" ON "Comment"("story");

-- CreateIndex
CREATE INDEX "Comment_parent_idx" ON "Comment"("parent");

-- CreateIndex
CREATE INDEX "Comment_root_idx" ON "Comment"("root");

-- CreateIndex
CREATE INDEX "Comment_createdBy_idx" ON "Comment"("createdBy");

-- CreateIndex
CREATE INDEX "Comment_updatedBy_idx" ON "Comment"("updatedBy");

-- CreateIndex
CREATE INDEX "Pick_member_idx" ON "Pick"("member");

-- CreateIndex
CREATE INDEX "Pick_story_idx" ON "Pick"("story");

-- CreateIndex
CREATE INDEX "Pick_collection_idx" ON "Pick"("collection");

-- CreateIndex
CREATE INDEX "Pick_comment_idx" ON "Pick"("comment");

-- CreateIndex
CREATE INDEX "Pick_createdBy_idx" ON "Pick"("createdBy");

-- CreateIndex
CREATE INDEX "Pick_updatedBy_idx" ON "Pick"("updatedBy");

-- CreateIndex
CREATE INDEX "Publisher_createdBy_idx" ON "Publisher"("createdBy");

-- CreateIndex
CREATE INDEX "Publisher_updatedBy_idx" ON "Publisher"("updatedBy");

-- CreateIndex
CREATE INDEX "Collection_creator_idx" ON "Collection"("creator");

-- CreateIndex
CREATE INDEX "Collection_createdBy_idx" ON "Collection"("createdBy");

-- CreateIndex
CREATE INDEX "Collection_updatedBy_idx" ON "Collection"("updatedBy");

-- CreateIndex
CREATE INDEX "CollectionMember_member_idx" ON "CollectionMember"("member");

-- CreateIndex
CREATE INDEX "CollectionMember_collection_idx" ON "CollectionMember"("collection");

-- CreateIndex
CREATE INDEX "CollectionMember_added_by_idx" ON "CollectionMember"("added_by");

-- CreateIndex
CREATE INDEX "CollectionMember_updated_by_idx" ON "CollectionMember"("updated_by");

-- CreateIndex
CREATE INDEX "CollectionMember_createdBy_idx" ON "CollectionMember"("createdBy");

-- CreateIndex
CREATE INDEX "CollectionMember_updatedBy_idx" ON "CollectionMember"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "InvitationCode_receive_key" ON "InvitationCode"("receive");

-- CreateIndex
CREATE INDEX "InvitationCode_send_idx" ON "InvitationCode"("send");

-- CreateIndex
CREATE INDEX "InvitationCode_createdBy_idx" ON "InvitationCode"("createdBy");

-- CreateIndex
CREATE INDEX "InvitationCode_updatedBy_idx" ON "InvitationCode"("updatedBy");

-- CreateIndex
CREATE INDEX "Story_source_idx" ON "Story"("source");

-- CreateIndex
CREATE INDEX "Story_author_idx" ON "Story"("author");

-- CreateIndex
CREATE INDEX "Story_category_idx" ON "Story"("category");

-- CreateIndex
CREATE INDEX "Story_createdBy_idx" ON "Story"("createdBy");

-- CreateIndex
CREATE INDEX "Story_updatedBy_idx" ON "Story"("updatedBy");

-- CreateIndex
CREATE INDEX "Tag_createdBy_idx" ON "Tag"("createdBy");

-- CreateIndex
CREATE INDEX "Tag_updatedBy_idx" ON "Tag"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "Member_firebaseId_key" ON "Member"("firebaseId");

-- CreateIndex
CREATE UNIQUE INDEX "Member_email_key" ON "Member"("email");

-- CreateIndex
CREATE INDEX "Member_createdBy_idx" ON "Member"("createdBy");

-- CreateIndex
CREATE INDEX "Member_updatedBy_idx" ON "Member"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "_Member_following_category_AB_unique" ON "_Member_following_category"("A", "B");

-- CreateIndex
CREATE INDEX "_Member_following_category_B_index" ON "_Member_following_category"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Comment_like_AB_unique" ON "_Comment_like"("A", "B");

-- CreateIndex
CREATE INDEX "_Comment_like_B_index" ON "_Comment_like"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Pick_pick_comment_AB_unique" ON "_Pick_pick_comment"("A", "B");

-- CreateIndex
CREATE INDEX "_Pick_pick_comment_B_index" ON "_Pick_pick_comment"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Collection_comment_AB_unique" ON "_Collection_comment"("A", "B");

-- CreateIndex
CREATE INDEX "_Collection_comment_B_index" ON "_Collection_comment"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Member_comment_AB_unique" ON "_Member_comment"("A", "B");

-- CreateIndex
CREATE INDEX "_Member_comment_B_index" ON "_Member_comment"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Tag_pick_AB_unique" ON "_Tag_pick"("A", "B");

-- CreateIndex
CREATE INDEX "_Tag_pick_B_index" ON "_Tag_pick"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Member_follow_publisher_AB_unique" ON "_Member_follow_publisher"("A", "B");

-- CreateIndex
CREATE INDEX "_Member_follow_publisher_B_index" ON "_Member_follow_publisher"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Member_following_collection_AB_unique" ON "_Member_following_collection"("A", "B");

-- CreateIndex
CREATE INDEX "_Member_following_collection_B_index" ON "_Member_following_collection"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Member_follower_AB_unique" ON "_Member_follower"("A", "B");

-- CreateIndex
CREATE INDEX "_Member_follower_B_index" ON "_Member_follower"("B");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_member_fkey" FOREIGN KEY ("member") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_story_fkey" FOREIGN KEY ("story") REFERENCES "Story"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_parent_fkey" FOREIGN KEY ("parent") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_root_fkey" FOREIGN KEY ("root") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pick" ADD CONSTRAINT "Pick_member_fkey" FOREIGN KEY ("member") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pick" ADD CONSTRAINT "Pick_story_fkey" FOREIGN KEY ("story") REFERENCES "Story"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pick" ADD CONSTRAINT "Pick_collection_fkey" FOREIGN KEY ("collection") REFERENCES "Collection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pick" ADD CONSTRAINT "Pick_comment_fkey" FOREIGN KEY ("comment") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pick" ADD CONSTRAINT "Pick_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pick" ADD CONSTRAINT "Pick_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Publisher" ADD CONSTRAINT "Publisher_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Publisher" ADD CONSTRAINT "Publisher_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_creator_fkey" FOREIGN KEY ("creator") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionMember" ADD CONSTRAINT "CollectionMember_member_fkey" FOREIGN KEY ("member") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionMember" ADD CONSTRAINT "CollectionMember_collection_fkey" FOREIGN KEY ("collection") REFERENCES "Collection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionMember" ADD CONSTRAINT "CollectionMember_added_by_fkey" FOREIGN KEY ("added_by") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionMember" ADD CONSTRAINT "CollectionMember_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionMember" ADD CONSTRAINT "CollectionMember_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionMember" ADD CONSTRAINT "CollectionMember_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvitationCode" ADD CONSTRAINT "InvitationCode_send_fkey" FOREIGN KEY ("send") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvitationCode" ADD CONSTRAINT "InvitationCode_receive_fkey" FOREIGN KEY ("receive") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvitationCode" ADD CONSTRAINT "InvitationCode_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvitationCode" ADD CONSTRAINT "InvitationCode_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Story" ADD CONSTRAINT "Story_source_fkey" FOREIGN KEY ("source") REFERENCES "Publisher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Story" ADD CONSTRAINT "Story_author_fkey" FOREIGN KEY ("author") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Story" ADD CONSTRAINT "Story_category_fkey" FOREIGN KEY ("category") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Story" ADD CONSTRAINT "Story_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Story" ADD CONSTRAINT "Story_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Member_following_category" ADD FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Member_following_category" ADD FOREIGN KEY ("B") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Comment_like" ADD FOREIGN KEY ("A") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Comment_like" ADD FOREIGN KEY ("B") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Pick_pick_comment" ADD FOREIGN KEY ("A") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Pick_pick_comment" ADD FOREIGN KEY ("B") REFERENCES "Pick"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Collection_comment" ADD FOREIGN KEY ("A") REFERENCES "Collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Collection_comment" ADD FOREIGN KEY ("B") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Member_comment" ADD FOREIGN KEY ("A") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Member_comment" ADD FOREIGN KEY ("B") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Tag_pick" ADD FOREIGN KEY ("A") REFERENCES "Pick"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Tag_pick" ADD FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Member_follow_publisher" ADD FOREIGN KEY ("A") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Member_follow_publisher" ADD FOREIGN KEY ("B") REFERENCES "Publisher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Member_following_collection" ADD FOREIGN KEY ("A") REFERENCES "Collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Member_following_collection" ADD FOREIGN KEY ("B") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Member_follower" ADD FOREIGN KEY ("A") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Member_follower" ADD FOREIGN KEY ("B") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
