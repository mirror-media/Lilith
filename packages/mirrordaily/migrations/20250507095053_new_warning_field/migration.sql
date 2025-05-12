-- CreateTable
CREATE TABLE "_Post_Warningv2" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_Post_Warningv2_AB_unique" ON "_Post_Warningv2"("A", "B");

-- CreateIndex
CREATE INDEX "_Post_Warningv2_B_index" ON "_Post_Warningv2"("B");

-- AddForeignKey
ALTER TABLE "_Post_Warningv2" ADD CONSTRAINT "_Post_Warningv2_A_fkey" FOREIGN KEY ("A") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_Warningv2" ADD CONSTRAINT "_Post_Warningv2_B_fkey" FOREIGN KEY ("B") REFERENCES "Warning"("id") ON DELETE CASCADE ON UPDATE CASCADE;
