-- AlterTable
ALTER TABLE "Person" ADD COLUMN     "thread_parent" INTEGER,
ALTER COLUMN "status" SET DEFAULT E'notverified';

-- AlterTable
ALTER TABLE "Politic" ADD COLUMN     "thread_parent" INTEGER,
ALTER COLUMN "status" SET DEFAULT E'notverified';

-- CreateIndex
CREATE INDEX "Person_thread_parent_idx" ON "Person"("thread_parent");

-- CreateIndex
CREATE INDEX "Politic_thread_parent_idx" ON "Politic"("thread_parent");

-- AddForeignKey
ALTER TABLE "Person" ADD CONSTRAINT "Person_thread_parent_fkey" FOREIGN KEY ("thread_parent") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Politic" ADD CONSTRAINT "Politic_thread_parent_fkey" FOREIGN KEY ("thread_parent") REFERENCES "Politic"("id") ON DELETE SET NULL ON UPDATE CASCADE;
