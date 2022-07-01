-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "event_end" TIMESTAMP(3),
ADD COLUMN     "event_start" TIMESTAMP(3),
ADD COLUMN     "host" TEXT NOT NULL DEFAULT E'',
ADD COLUMN     "hosted_type" TEXT NOT NULL DEFAULT E'主辦單位',
ADD COLUMN     "hosted_type2" TEXT NOT NULL DEFAULT E'協辦單位',
ADD COLUMN     "hosted_type3" TEXT NOT NULL DEFAULT E'承辦單位';

-- CreateTable
CREATE TABLE "_Event_hosted_logo2" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Event_hosted_logo3" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_Event_hosted_logo2_AB_unique" ON "_Event_hosted_logo2"("A", "B");

-- CreateIndex
CREATE INDEX "_Event_hosted_logo2_B_index" ON "_Event_hosted_logo2"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Event_hosted_logo3_AB_unique" ON "_Event_hosted_logo3"("A", "B");

-- CreateIndex
CREATE INDEX "_Event_hosted_logo3_B_index" ON "_Event_hosted_logo3"("B");

-- AddForeignKey
ALTER TABLE "_Event_hosted_logo2" ADD FOREIGN KEY ("A") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Event_hosted_logo2" ADD FOREIGN KEY ("B") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Event_hosted_logo3" ADD FOREIGN KEY ("A") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Event_hosted_logo3" ADD FOREIGN KEY ("B") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;
