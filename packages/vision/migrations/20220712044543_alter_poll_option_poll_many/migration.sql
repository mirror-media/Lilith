/*
  Warnings:

  - You are about to drop the column `poll` on the `PollOption` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "PollOption" DROP CONSTRAINT "PollOption_poll_fkey";

-- DropIndex
DROP INDEX "PollOption_poll_idx";

-- AlterTable
ALTER TABLE "PollOption" DROP COLUMN "poll";

-- CreateTable
CREATE TABLE "_Poll_options" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_Poll_options_AB_unique" ON "_Poll_options"("A", "B");

-- CreateIndex
CREATE INDEX "_Poll_options_B_index" ON "_Poll_options"("B");

-- AddForeignKey
ALTER TABLE "_Poll_options" ADD FOREIGN KEY ("A") REFERENCES "Poll"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Poll_options" ADD FOREIGN KEY ("B") REFERENCES "PollOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;
