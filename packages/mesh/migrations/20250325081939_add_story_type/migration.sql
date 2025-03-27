-- CreateTable
CREATE TABLE "StoryType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "StoryType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_Publisher_story_type" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "StoryType_name_key" ON "StoryType"("name");

-- CreateIndex
CREATE INDEX "StoryType_createdBy_idx" ON "StoryType"("createdBy");

-- CreateIndex
CREATE INDEX "StoryType_updatedBy_idx" ON "StoryType"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "_Publisher_story_type_AB_unique" ON "_Publisher_story_type"("A", "B");

-- CreateIndex
CREATE INDEX "_Publisher_story_type_B_index" ON "_Publisher_story_type"("B");

-- AddForeignKey
ALTER TABLE "StoryType" ADD CONSTRAINT "StoryType_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryType" ADD CONSTRAINT "StoryType_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Publisher_story_type" ADD FOREIGN KEY ("A") REFERENCES "Publisher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Publisher_story_type" ADD FOREIGN KEY ("B") REFERENCES "StoryType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
