-- AlterTable
ALTER TABLE "User" ADD COLUMN     "author" INTEGER;

-- CreateTable
CREATE TABLE "_Contact_sections" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_Contact_sections_AB_unique" ON "_Contact_sections"("A", "B");

-- CreateIndex
CREATE INDEX "_Contact_sections_B_index" ON "_Contact_sections"("B");

-- CreateIndex
CREATE INDEX "User_author_idx" ON "User"("author");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_author_fkey" FOREIGN KEY ("author") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Contact_sections" ADD CONSTRAINT "_Contact_sections_A_fkey" FOREIGN KEY ("A") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Contact_sections" ADD CONSTRAINT "_Contact_sections_B_fkey" FOREIGN KEY ("B") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add relationship between User and Contact
UPDATE "User" AS "U" SET "author" = "T"."id" FROM (SELECT "Contact"."id", "User"."id" AS "User_id" FROM "Contact" LEFT JOIN "User" ON ("Contact"."name" = "User"."name")) AS "T" WHERE "U"."id" = "T"."User_id";

-- Copy User-Section relationship to Contact-Section
INSERT INTO "_Contact_sections" ("A", "B") SELECT "C"."id", "US"."Section_id" FROM "Contact" AS "C" INNER JOIN (SELECT "User"."name", "Section"."id" AS "Section_id", "Section"."name" AS "Section_name" FROM "_User_sections" LEFT OUTER JOIN "User" ON ("_User_sections"."B" = "User"."id") LEFT OUTER JOIN "Section" ON ("_User_sections"."A" = "Section"."id")) AS "US" ON ("C"."name" = "US"."name");