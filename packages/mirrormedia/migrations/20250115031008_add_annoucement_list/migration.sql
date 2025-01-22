-- CreateEnum
CREATE TYPE "AnnouncementLevelType" AS ENUM ('info', 'warning');

-- CreateTable
CREATE TABLE "AnnouncementScope" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "AnnouncementScope_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Announcement" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "level" "AnnouncementLevelType" NOT NULL DEFAULT 'info',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_Announcement_scope" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "AnnouncementScope_name_key" ON "AnnouncementScope"("name");

-- CreateIndex
CREATE INDEX "AnnouncementScope_createdBy_idx" ON "AnnouncementScope"("createdBy");

-- CreateIndex
CREATE INDEX "AnnouncementScope_updatedBy_idx" ON "AnnouncementScope"("updatedBy");

-- CreateIndex
CREATE INDEX "Announcement_createdBy_idx" ON "Announcement"("createdBy");

-- CreateIndex
CREATE INDEX "Announcement_updatedBy_idx" ON "Announcement"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "_Announcement_scope_AB_unique" ON "_Announcement_scope"("A", "B");

-- CreateIndex
CREATE INDEX "_Announcement_scope_B_index" ON "_Announcement_scope"("B");

-- AddForeignKey
ALTER TABLE "AnnouncementScope" ADD CONSTRAINT "AnnouncementScope_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnnouncementScope" ADD CONSTRAINT "AnnouncementScope_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Announcement_scope" ADD CONSTRAINT "_Announcement_scope_A_fkey" FOREIGN KEY ("A") REFERENCES "Announcement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Announcement_scope" ADD CONSTRAINT "_Announcement_scope_B_fkey" FOREIGN KEY ("B") REFERENCES "AnnouncementScope"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Insert Initial AnnoucemnetScope records
INSERT INTO "AnnouncementScope" ("name", "description")
VALUES
('all', '全站'),
('papermag', '紙本雜誌')
ON CONFLICT ("name") DO NOTHING;