-- AlterTable
ALTER TABLE "Politic" ALTER COLUMN "current_progress" SET DEFAULT E'no-progress';

-- AlterTable
ALTER TABLE "PoliticExpert" ADD COLUMN     "expert" TEXT DEFAULT E'';
