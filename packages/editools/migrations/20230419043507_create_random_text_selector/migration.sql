-- CreateTable
CREATE TABLE "RandomTextSelector" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "json" TEXT NOT NULL DEFAULT E'',
    "shiftLeft" BOOLEAN NOT NULL DEFAULT false,
    "helper" INTEGER,
    "highlightDesktop_filesize" INTEGER,
    "highlightDesktop_extension" TEXT,
    "highlightDesktop_width" INTEGER,
    "highlightDesktop_height" INTEGER,
    "highlightDesktop_mode" TEXT,
    "highlightDesktop_id" TEXT,
    "highlightMobile_filesize" INTEGER,
    "highlightMobile_extension" TEXT,
    "highlightMobile_width" INTEGER,
    "highlightMobile_height" INTEGER,
    "highlightMobile_mode" TEXT,
    "highlightMobile_id" TEXT,
    "button_filesize" INTEGER,
    "button_extension" TEXT,
    "button_width" INTEGER,
    "button_height" INTEGER,
    "button_mode" TEXT,
    "button_id" TEXT,
    "buttonLabel" TEXT NOT NULL DEFAULT E'',
    "backgroundColor" TEXT NOT NULL DEFAULT E'#000',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "RandomTextSelector_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RandomTextSelector_helper_idx" ON "RandomTextSelector"("helper");

-- CreateIndex
CREATE INDEX "RandomTextSelector_createdBy_idx" ON "RandomTextSelector"("createdBy");

-- CreateIndex
CREATE INDEX "RandomTextSelector_updatedBy_idx" ON "RandomTextSelector"("updatedBy");

-- AddForeignKey
ALTER TABLE "RandomTextSelector" ADD CONSTRAINT "RandomTextSelector_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RandomTextSelector" ADD CONSTRAINT "RandomTextSelector_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RandomTextSelector" ADD CONSTRAINT "RandomTextSelector_helper_fkey" FOREIGN KEY ("helper") REFERENCES "ComponentHelp"("id") ON DELETE SET NULL ON UPDATE CASCADE;
