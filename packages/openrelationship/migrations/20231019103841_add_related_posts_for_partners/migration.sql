-- CreateTable
CREATE TABLE "RelatedPost" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "brief" TEXT NOT NULL DEFAULT '',
    "url" TEXT NOT NULL DEFAULT '',
    "ogIMage" TEXT NOT NULL DEFAULT '',
    "election" INTEGER,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "RelatedPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_FactcheckPartner_posts" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE INDEX "RelatedPost_election_idx" ON "RelatedPost"("election");

-- CreateIndex
CREATE INDEX "RelatedPost_createdBy_idx" ON "RelatedPost"("createdBy");

-- CreateIndex
CREATE INDEX "RelatedPost_updatedBy_idx" ON "RelatedPost"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "_FactcheckPartner_posts_AB_unique" ON "_FactcheckPartner_posts"("A", "B");

-- CreateIndex
CREATE INDEX "_FactcheckPartner_posts_B_index" ON "_FactcheckPartner_posts"("B");

-- AddForeignKey
ALTER TABLE "RelatedPost" ADD CONSTRAINT "RelatedPost_election_fkey" FOREIGN KEY ("election") REFERENCES "Election"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RelatedPost" ADD CONSTRAINT "RelatedPost_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RelatedPost" ADD CONSTRAINT "RelatedPost_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FactcheckPartner_posts" ADD CONSTRAINT "_FactcheckPartner_posts_A_fkey" FOREIGN KEY ("A") REFERENCES "FactcheckPartner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FactcheckPartner_posts" ADD CONSTRAINT "_FactcheckPartner_posts_B_fkey" FOREIGN KEY ("B") REFERENCES "RelatedPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
