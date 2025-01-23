-- CreateTable
CREATE TABLE "_Member_exclude_publisher" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_Member_exclude_publisher_AB_unique" ON "_Member_exclude_publisher"("A", "B");

-- CreateIndex
CREATE INDEX "_Member_exclude_publisher_B_index" ON "_Member_exclude_publisher"("B");

-- AddForeignKey
ALTER TABLE "_Member_exclude_publisher" ADD FOREIGN KEY ("A") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Member_exclude_publisher" ADD FOREIGN KEY ("B") REFERENCES "Publisher"("id") ON DELETE CASCADE ON UPDATE CASCADE;
