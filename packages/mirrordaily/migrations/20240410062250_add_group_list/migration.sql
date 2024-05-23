-- DropForeignKey
ALTER TABLE "_External_relateds" DROP CONSTRAINT "_External_relateds_B_fkey";

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
CREATE TABLE "_External_groups" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Group_posts" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE INDEX "Group_createdBy_idx" ON "Group"("createdBy");

-- CreateIndex
CREATE INDEX "Group_updatedBy_idx" ON "Group"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "_External_groups_AB_unique" ON "_External_groups"("A", "B");

-- CreateIndex
CREATE INDEX "_External_groups_B_index" ON "_External_groups"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Group_posts_AB_unique" ON "_Group_posts"("A", "B");

-- CreateIndex
CREATE INDEX "_Group_posts_B_index" ON "_Group_posts"("B");

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_External_relateds" ADD CONSTRAINT "_External_relateds_B_fkey" FOREIGN KEY ("B") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_External_groups" ADD CONSTRAINT "_External_groups_A_fkey" FOREIGN KEY ("A") REFERENCES "External"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_External_groups" ADD CONSTRAINT "_External_groups_B_fkey" FOREIGN KEY ("B") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Group_posts" ADD CONSTRAINT "_Group_posts_A_fkey" FOREIGN KEY ("A") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Group_posts" ADD CONSTRAINT "_Group_posts_B_fkey" FOREIGN KEY ("B") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
