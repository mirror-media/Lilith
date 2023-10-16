/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Post` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Post` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Project` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "Category_title_idx" ON "Category"("title");

-- CreateIndex
CREATE INDEX "Category_state_idx" ON "Category"("state");

-- CreateIndex
CREATE INDEX "Category_style_idx" ON "Category"("style");

-- CreateIndex
CREATE UNIQUE INDEX "Post_name_key" ON "Post"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Project_name_key" ON "Project"("name");
