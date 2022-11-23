-- CreateTable
CREATE TABLE "Member" (
    "id" SERIAL NOT NULL,
    "firebaseId" TEXT NOT NULL DEFAULT E'',
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "email" TEXT NOT NULL DEFAULT E'',
    "beginDate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_Member_sections" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Member_favoritePosts" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Member_firebaseId_key" ON "Member"("firebaseId");

-- CreateIndex
CREATE INDEX "Member_createdBy_idx" ON "Member"("createdBy");

-- CreateIndex
CREATE INDEX "Member_updatedBy_idx" ON "Member"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "_Member_sections_AB_unique" ON "_Member_sections"("A", "B");

-- CreateIndex
CREATE INDEX "_Member_sections_B_index" ON "_Member_sections"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Member_favoritePosts_AB_unique" ON "_Member_favoritePosts"("A", "B");

-- CreateIndex
CREATE INDEX "_Member_favoritePosts_B_index" ON "_Member_favoritePosts"("B");

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Member_sections" ADD FOREIGN KEY ("A") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Member_sections" ADD FOREIGN KEY ("B") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Member_favoritePosts" ADD FOREIGN KEY ("A") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Member_favoritePosts" ADD FOREIGN KEY ("B") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
