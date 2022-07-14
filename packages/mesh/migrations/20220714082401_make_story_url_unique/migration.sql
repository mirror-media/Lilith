/*
  Warnings:

  - A unique constraint covering the columns `[url]` on the table `Story` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Story_url_key" ON "Story"("url");
