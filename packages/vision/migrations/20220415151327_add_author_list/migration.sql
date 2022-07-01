-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "copyright" TEXT DEFAULT E'reserved';

-- CreateTable
CREATE TABLE "Author" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "column" TEXT NOT NULL DEFAULT E'',
    "email" TEXT NOT NULL DEFAULT E'',
    "profile_photo" INTEGER,
    "intro" JSONB NOT NULL DEFAULT E'[{"type":"paragraph","children":[{"text":""}]}]',

    CONSTRAINT "Author_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_Author_ref_posts" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Author_email_key" ON "Author"("email");

-- CreateIndex
CREATE INDEX "Author_profile_photo_idx" ON "Author"("profile_photo");

-- CreateIndex
CREATE UNIQUE INDEX "_Author_ref_posts_AB_unique" ON "_Author_ref_posts"("A", "B");

-- CreateIndex
CREATE INDEX "_Author_ref_posts_B_index" ON "_Author_ref_posts"("B");

-- AddForeignKey
ALTER TABLE "Author" ADD CONSTRAINT "Author_profile_photo_fkey" FOREIGN KEY ("profile_photo") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Author_ref_posts" ADD FOREIGN KEY ("A") REFERENCES "Author"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Author_ref_posts" ADD FOREIGN KEY ("B") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
