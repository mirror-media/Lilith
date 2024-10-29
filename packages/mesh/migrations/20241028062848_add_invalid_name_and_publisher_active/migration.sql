-- AlterTable
ALTER TABLE "Publisher" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "InvalidName" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "InvalidName_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InvalidName_createdBy_idx" ON "InvalidName"("createdBy");

-- CreateIndex
CREATE INDEX "InvalidName_updatedBy_idx" ON "InvalidName"("updatedBy");

-- AddForeignKey
ALTER TABLE "InvalidName" ADD CONSTRAINT "InvalidName_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvalidName" ADD CONSTRAINT "InvalidName_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
