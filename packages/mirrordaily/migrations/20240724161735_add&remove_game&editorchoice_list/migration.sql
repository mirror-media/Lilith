ALTER TABLE "Game"
ADD COLUMN "descriptions" TEXT NOT NULL DEFAULT '',
ADD COLUMN "sortOrder" INTEGER;

ALTER TABLE "EditorChoice"
ADD COLUMN "heroImage" INTEGER;

ALTER TABLE "EditorChoice"
DROP COLUMN "publishedDate";