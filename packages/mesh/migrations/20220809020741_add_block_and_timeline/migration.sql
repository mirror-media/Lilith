-- AlterTable
ALTER TABLE "CollectionPick" ADD COLUMN     "custom_time" TIMESTAMP(3),
ADD COLUMN     "customer_day" TEXT NOT NULL DEFAULT E'',
ADD COLUMN     "customer_month" TEXT NOT NULL DEFAULT E'',
ADD COLUMN     "customer_year" TEXT NOT NULL DEFAULT E'';

-- CreateTable
CREATE TABLE "_Member_block" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_Member_block_AB_unique" ON "_Member_block"("A", "B");

-- CreateIndex
CREATE INDEX "_Member_block_B_index" ON "_Member_block"("B");

-- AddForeignKey
ALTER TABLE "_Member_block" ADD FOREIGN KEY ("A") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Member_block" ADD FOREIGN KEY ("B") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
