-- CreateTable
CREATE TABLE "CollectionPick" (
    "id" SERIAL NOT NULL,
    "story" INTEGER,
    "collection" INTEGER,
    "summary" TEXT NOT NULL DEFAULT E'',
    "creator" INTEGER,
    "objective" TEXT,
    "picked_date" TIMESTAMP(3),
    "updated_date" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "CollectionPick_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CollectionPick_story_idx" ON "CollectionPick"("story");

-- CreateIndex
CREATE INDEX "CollectionPick_collection_idx" ON "CollectionPick"("collection");

-- CreateIndex
CREATE INDEX "CollectionPick_creator_idx" ON "CollectionPick"("creator");

-- CreateIndex
CREATE INDEX "CollectionPick_createdBy_idx" ON "CollectionPick"("createdBy");

-- CreateIndex
CREATE INDEX "CollectionPick_updatedBy_idx" ON "CollectionPick"("updatedBy");

-- AddForeignKey
ALTER TABLE "CollectionPick" ADD CONSTRAINT "CollectionPick_story_fkey" FOREIGN KEY ("story") REFERENCES "Story"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionPick" ADD CONSTRAINT "CollectionPick_collection_fkey" FOREIGN KEY ("collection") REFERENCES "Collection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionPick" ADD CONSTRAINT "CollectionPick_creator_fkey" FOREIGN KEY ("creator") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionPick" ADD CONSTRAINT "CollectionPick_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionPick" ADD CONSTRAINT "CollectionPick_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
