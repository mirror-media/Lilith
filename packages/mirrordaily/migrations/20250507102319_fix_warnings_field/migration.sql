/*
  Warnings:

  - You are about to drop the `_Post_Warningv2` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_Post_Warningv2" DROP CONSTRAINT "_Post_Warningv2_A_fkey";

-- DropForeignKey
ALTER TABLE "_Post_Warningv2" DROP CONSTRAINT "_Post_Warningv2_B_fkey";

-- DropTable
DROP TABLE "_Post_Warningv2";

-- CreateTable
CREATE TABLE "_Post_Warnings" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_Post_Warnings_AB_unique" ON "_Post_Warnings"("A", "B");

-- CreateIndex
CREATE INDEX "_Post_Warnings_B_index" ON "_Post_Warnings"("B");

-- AddForeignKey
ALTER TABLE "_Post_Warnings" ADD CONSTRAINT "_Post_Warnings_A_fkey" FOREIGN KEY ("A") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_Warnings" ADD CONSTRAINT "_Post_Warnings_B_fkey" FOREIGN KEY ("B") REFERENCES "Warning"("id") ON DELETE CASCADE ON UPDATE CASCADE;
