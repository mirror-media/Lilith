-- CreateTable
CREATE TABLE "Notify" (
    "id" SERIAL NOT NULL,
    "member" INTEGER,
    "type" TEXT,
    "sender" INTEGER,
    "object_id" INTEGER,
    "state" TEXT DEFAULT E'public',
    "action_date" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Notify_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notify_member_idx" ON "Notify"("member");

-- CreateIndex
CREATE INDEX "Notify_sender_idx" ON "Notify"("sender");

-- CreateIndex
CREATE INDEX "Notify_createdBy_idx" ON "Notify"("createdBy");

-- CreateIndex
CREATE INDEX "Notify_updatedBy_idx" ON "Notify"("updatedBy");

-- AddForeignKey
ALTER TABLE "Notify" ADD CONSTRAINT "Notify_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notify" ADD CONSTRAINT "Notify_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notify" ADD CONSTRAINT "Notify_member_fkey" FOREIGN KEY ("member") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notify" ADD CONSTRAINT "Notify_sender_fkey" FOREIGN KEY ("sender") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;
