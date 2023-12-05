-- AlterTable
ALTER TABLE "OrganizationsElection" ALTER COLUMN "first_obtained_number" DROP DEFAULT,
ALTER COLUMN "second_obtained_number" DROP DEFAULT;

-- Create temperary field for data migration
ALTER TABLE "PersonElection" ADD COLUMN  "temp_legislatoratlarge_number" INTEGER;

-- Convert original data and write them to temperary field
UPDATE "PersonElection" SET "temp_legislatoratlarge_number" = 
	(CASE
		WHEN "legislatoratlarge_number" = '' THEN NULL
		ELSE CAST ("legislatoratlarge_number" AS INTEGER)
	END);

-- AlterTable
ALTER TABLE "PersonElection" DROP COLUMN "legislatoratlarge_number",
ADD COLUMN     "legislatoratlarge_number" INTEGER;

-- Write back data to source field
UPDATE "PersonElection" SET "legislatoratlarge_number" = "temp_legislatoratlarge_number";

-- Remove temperary field
ALTER TABLE "PersonElection" DROP COLUMN "temp_legislatoratlarge_number";
