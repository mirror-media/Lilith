-- CreateTable
CREATE TABLE "DroppingText" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "textArr" JSONB DEFAULT '["這是","Dropping Text","套件"]',
    "shiftLeft" BOOLEAN NOT NULL DEFAULT false,
    "helper" INTEGER,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "DroppingText_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DroppingText_helper_idx" ON "DroppingText"("helper");

-- CreateIndex
CREATE INDEX "DroppingText_createdBy_idx" ON "DroppingText"("createdBy");

-- CreateIndex
CREATE INDEX "DroppingText_updatedBy_idx" ON "DroppingText"("updatedBy");

-- AddForeignKey
ALTER TABLE "DroppingText" ADD CONSTRAINT "DroppingText_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DroppingText" ADD CONSTRAINT "DroppingText_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DroppingText" ADD CONSTRAINT "DroppingText_helper_fkey" FOREIGN KEY ("helper") REFERENCES "ComponentHelp"("id") ON DELETE SET NULL ON UPDATE CASCADE;
