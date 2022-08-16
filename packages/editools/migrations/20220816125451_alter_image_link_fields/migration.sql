/*
  Warnings:

  - You are about to drop the column `imageLink` on the `Form` table. All the data in the column will be lost.
  - You are about to drop the column `mobilImageLink` on the `Form` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Field" ADD COLUMN     "heroImageLink" TEXT NOT NULL DEFAULT E'';

-- AlterTable
ALTER TABLE "FieldOption" ADD COLUMN     "heroImageLink" TEXT NOT NULL DEFAULT E'';

-- AlterTable
ALTER TABLE "Form" DROP COLUMN "imageLink",
DROP COLUMN "mobilImageLink",
ADD COLUMN     "heroImageLink" TEXT NOT NULL DEFAULT E'',
ADD COLUMN     "heroVideoLink" TEXT NOT NULL DEFAULT E'',
ADD COLUMN     "mobileImageLink" TEXT NOT NULL DEFAULT E'';

-- AlterTable
ALTER TABLE "FormAnswer" ADD COLUMN     "heroImageLink" TEXT NOT NULL DEFAULT E'',
ADD COLUMN     "mobileHeroImageLink" TEXT NOT NULL DEFAULT E'';
