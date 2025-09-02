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
CREATE TABLE "Image" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "imageFile_filesize" INTEGER,
    "imageFile_extension" TEXT,
    "imageFile_width" INTEGER,
    "imageFile_height" INTEGER,
    "imageFile_id" TEXT,
    "file_filesize" INTEGER,
    "file_filename" TEXT,
    "urlOriginal" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Video" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "youtubeUrl" TEXT NOT NULL DEFAULT '',
    "file_filesize" INTEGER,
    "file_filename" TEXT,
    "coverPhoto" INTEGER,
    "description" TEXT NOT NULL DEFAULT '',
    "meta" TEXT NOT NULL DEFAULT '',
    "duration" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Member" (
    "id" SERIAL NOT NULL,
    "firebaseID" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "state" TEXT NOT NULL DEFAULT 'active',
    "name" TEXT,
    "mobile" TEXT,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "member" INTEGER,
    "type" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'paid',
    "paragraphOne" TEXT,
    "paragraphTwo" TEXT,
    "image" INTEGER,
    "schedule" TEXT,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_Order_demoImage" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Order_relatedOrder" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Image_createdBy_idx" ON "Image"("createdBy");

-- CreateIndex
CREATE INDEX "Image_updatedBy_idx" ON "Image"("updatedBy");

-- CreateIndex
CREATE INDEX "Video_coverPhoto_idx" ON "Video"("coverPhoto");

-- CreateIndex
CREATE INDEX "Video_createdBy_idx" ON "Video"("createdBy");

-- CreateIndex
CREATE INDEX "Video_updatedBy_idx" ON "Video"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "Member_firebaseID_key" ON "Member"("firebaseID");

-- CreateIndex
CREATE UNIQUE INDEX "Member_email_key" ON "Member"("email");

-- CreateIndex
CREATE INDEX "Member_createdBy_idx" ON "Member"("createdBy");

-- CreateIndex
CREATE INDEX "Member_updatedBy_idx" ON "Member"("updatedBy");

-- CreateIndex
CREATE INDEX "Order_member_idx" ON "Order"("member");

-- CreateIndex
CREATE INDEX "Order_image_idx" ON "Order"("image");

-- CreateIndex
CREATE INDEX "Order_createdBy_idx" ON "Order"("createdBy");

-- CreateIndex
CREATE INDEX "Order_updatedBy_idx" ON "Order"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "_Order_demoImage_AB_unique" ON "_Order_demoImage"("A", "B");

-- CreateIndex
CREATE INDEX "_Order_demoImage_B_index" ON "_Order_demoImage"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Order_relatedOrder_AB_unique" ON "_Order_relatedOrder"("A", "B");

-- CreateIndex
CREATE INDEX "_Order_relatedOrder_B_index" ON "_Order_relatedOrder"("B");

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_coverPhoto_fkey" FOREIGN KEY ("coverPhoto") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_member_fkey" FOREIGN KEY ("member") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_image_fkey" FOREIGN KEY ("image") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Order_demoImage" ADD CONSTRAINT "_Order_demoImage_A_fkey" FOREIGN KEY ("A") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Order_demoImage" ADD CONSTRAINT "_Order_demoImage_B_fkey" FOREIGN KEY ("B") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Order_relatedOrder" ADD CONSTRAINT "_Order_relatedOrder_A_fkey" FOREIGN KEY ("A") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Order_relatedOrder" ADD CONSTRAINT "_Order_relatedOrder_B_fkey" FOREIGN KEY ("B") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
