/*
  Warnings:

  - You are about to drop the column `sourceLink` on the `InfoGraph` table. All the data in the column will be lost.
  - The `dataSource` column on the `InfoGraph` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "InfoGraph" DROP COLUMN "sourceLink",
DROP COLUMN "dataSource",
ADD COLUMN     "dataSource" JSONB NOT NULL DEFAULT E'[{"type":"paragraph","children":[{"text":""}]}]';
