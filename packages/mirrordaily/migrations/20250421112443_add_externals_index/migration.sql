/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `External` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "External_slug_key" ON "External"("slug");

-- CreateIndex
CREATE INDEX "External_title_idx" ON "External"("title");
