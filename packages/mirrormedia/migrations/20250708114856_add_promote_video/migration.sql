-- CreateTable
CREATE TABLE "PromoteVideo" (
    "id" SERIAL NOT NULL,
    "order" INTEGER,
    "videoLink" TEXT NOT NULL DEFAULT '',
    "state" TEXT DEFAULT 'published',
    "publishedDate" TIMESTAMP(3),
    "isFixed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "PromoteVideo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PromoteVideo_order_key" ON "PromoteVideo"("order");

-- CreateIndex
CREATE INDEX "PromoteVideo_state_idx" ON "PromoteVideo"("state");

-- CreateIndex
CREATE INDEX "PromoteVideo_publishedDate_idx" ON "PromoteVideo"("publishedDate");

-- CreateIndex
CREATE INDEX "PromoteVideo_createdBy_idx" ON "PromoteVideo"("createdBy");

-- CreateIndex
CREATE INDEX "PromoteVideo_updatedBy_idx" ON "PromoteVideo"("updatedBy");

-- AddForeignKey
ALTER TABLE "PromoteVideo" ADD CONSTRAINT "PromoteVideo_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromoteVideo" ADD CONSTRAINT "PromoteVideo_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
