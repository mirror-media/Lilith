-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "email" TEXT NOT NULL DEFAULT E'',
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "isProtected" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL DEFAULT E'',
    "other_label" TEXT NOT NULL DEFAULT E'',
    "role" TEXT NOT NULL DEFAULT E'',
    "organization" INTEGER,
    "area" INTEGER,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "links" TEXT NOT NULL DEFAULT E'',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Area" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "identifiers" TEXT NOT NULL DEFAULT E'',
    "classification" TEXT NOT NULL DEFAULT E'',
    "parent" INTEGER,
    "geometry" TEXT NOT NULL DEFAULT E'',
    "posts" TEXT NOT NULL DEFAULT E'',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Area_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "description" TEXT NOT NULL DEFAULT E'',
    "start_date" TEXT NOT NULL DEFAULT E'',
    "end_date" TEXT NOT NULL DEFAULT E'',
    "location" TEXT NOT NULL DEFAULT E'',
    "status" TEXT NOT NULL DEFAULT E'',
    "identifier" TEXT NOT NULL DEFAULT E'',
    "motion" TEXT NOT NULL DEFAULT E'',
    "classification" TEXT NOT NULL DEFAULT E'',
    "organization" TEXT NOT NULL DEFAULT E'',
    "attendees" TEXT NOT NULL DEFAULT E'',
    "parent" TEXT NOT NULL DEFAULT E'',
    "children" TEXT NOT NULL DEFAULT E'',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Election" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "description" TEXT NOT NULL DEFAULT E'',
    "election_year_year" INTEGER,
    "election_year_month" INTEGER,
    "election_year_day" INTEGER,
    "type" TEXT,
    "register_date" TEXT NOT NULL DEFAULT E'',
    "location" TEXT NOT NULL DEFAULT E'',
    "status" TEXT NOT NULL DEFAULT E'',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Election_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vote" (
    "id" SERIAL NOT NULL,
    "vote_event" TEXT NOT NULL DEFAULT E'',
    "voter" TEXT NOT NULL DEFAULT E'',
    "option" TEXT NOT NULL DEFAULT E'',
    "group" TEXT NOT NULL DEFAULT E'',
    "role" TEXT NOT NULL DEFAULT E'',
    "weight" TEXT NOT NULL DEFAULT E'',
    "pair" INTEGER,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Person" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "alternative" TEXT,
    "other_names" TEXT,
    "email" TEXT,
    "gender" TEXT,
    "birth_date_year" INTEGER,
    "birth_date_month" INTEGER,
    "birth_date_day" INTEGER,
    "death_date_year" INTEGER,
    "death_date_month" INTEGER,
    "death_date_day" INTEGER,
    "image" TEXT,
    "summary" TEXT,
    "biography" TEXT,
    "national_identity" TEXT,
    "contact_details" TEXT,
    "links" TEXT,
    "source" TEXT,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Motion" (
    "id" SERIAL NOT NULL,
    "organization" TEXT NOT NULL DEFAULT E'',
    "legislative_session" TEXT NOT NULL DEFAULT E'',
    "creator" TEXT NOT NULL DEFAULT E'',
    "text" TEXT NOT NULL DEFAULT E'',
    "identifier" TEXT NOT NULL DEFAULT E'',
    "classification" TEXT NOT NULL DEFAULT E'',
    "date" TEXT NOT NULL DEFAULT E'',
    "requirement" TEXT NOT NULL DEFAULT E'',
    "result" TEXT NOT NULL DEFAULT E'',
    "vote_events" TEXT NOT NULL DEFAULT E'',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Motion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "alternative" TEXT,
    "other_names" TEXT,
    "identifiers" TEXT,
    "classification" TEXT,
    "abstract" TEXT,
    "description" TEXT,
    "founding_date_year" INTEGER,
    "founding_date_month" INTEGER,
    "founding_date_day" INTEGER,
    "dissolution_date_year" INTEGER,
    "dissolution_date_month" INTEGER,
    "dissolution_date_day" INTEGER,
    "image" TEXT,
    "contact_details" TEXT,
    "links" TEXT,
    "address" TEXT,
    "source" TEXT,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Collaborate" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "email" TEXT NOT NULL DEFAULT E'',
    "feedback" TEXT NOT NULL DEFAULT E'',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Collaborate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Membership" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL DEFAULT E'',
    "role" TEXT NOT NULL DEFAULT E'',
    "member" INTEGER,
    "organization" INTEGER,
    "posts" INTEGER,
    "on_behalf_of_id" TEXT NOT NULL DEFAULT E'',
    "area" INTEGER,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "links" TEXT NOT NULL DEFAULT E'',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Membership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactDetail" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL DEFAULT E'',
    "type" TEXT NOT NULL DEFAULT E'',
    "value" TEXT NOT NULL DEFAULT E'',
    "valid_from" TIMESTAMP(3),
    "valid_until" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "ContactDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Count" (
    "id" SERIAL NOT NULL,
    "option" TEXT NOT NULL DEFAULT E'',
    "value" TEXT NOT NULL DEFAULT E'',
    "group" TEXT NOT NULL DEFAULT E'',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Count_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationsElection" (
    "id" SERIAL NOT NULL,
    "organization_id" INTEGER,
    "election_year_year" INTEGER,
    "election_year_month" INTEGER,
    "election_year_day" INTEGER,
    "number" TEXT NOT NULL DEFAULT E'',
    "votes_obtained_number" TEXT NOT NULL DEFAULT E'',
    "seats" TEXT NOT NULL DEFAULT E'',
    "source" TEXT NOT NULL DEFAULT E'',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "OrganizationsElection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationsRelationship" (
    "id" SERIAL NOT NULL,
    "organization_id" INTEGER,
    "related_organization_id" INTEGER,
    "relative" TEXT,
    "start_date_year" INTEGER,
    "start_date_month" INTEGER,
    "start_date_day" INTEGER,
    "end_date_year" INTEGER,
    "end_date_month" INTEGER,
    "end_date_day" INTEGER,
    "source" TEXT,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "OrganizationsRelationship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonElection" (
    "id" SERIAL NOT NULL,
    "person_id" INTEGER,
    "election" INTEGER,
    "party" TEXT NOT NULL DEFAULT E'',
    "legislatoratlarge_number" TEXT NOT NULL DEFAULT E'',
    "number" TEXT NOT NULL DEFAULT E'',
    "electoral_district" TEXT NOT NULL DEFAULT E'',
    "votes_obtained_number" TEXT NOT NULL DEFAULT E'',
    "votes_obtained_percentage" TEXT NOT NULL DEFAULT E'',
    "elected" TEXT NOT NULL DEFAULT E'',
    "incumbent" TEXT NOT NULL DEFAULT E'',
    "source" TEXT NOT NULL DEFAULT E'',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "PersonElection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonOrganization" (
    "id" SERIAL NOT NULL,
    "person_id" INTEGER,
    "organization_id" INTEGER,
    "role" TEXT,
    "start_date_year" INTEGER,
    "start_date_month" INTEGER,
    "start_date_day" INTEGER,
    "end_date_year" INTEGER,
    "end_date_month" INTEGER,
    "end_date_day" INTEGER,
    "source" TEXT,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "PersonOrganization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonPublication" (
    "id" SERIAL NOT NULL,
    "person_id" INTEGER,
    "organization_id" INTEGER,
    "role" TEXT NOT NULL DEFAULT E'',
    "start_date_year" INTEGER,
    "start_date_month" INTEGER,
    "start_date_day" INTEGER,
    "end_date_year" INTEGER,
    "end_date_month" INTEGER,
    "end_date_day" INTEGER,
    "source" TEXT NOT NULL DEFAULT E'',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "PersonPublication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonRelationship" (
    "id" SERIAL NOT NULL,
    "person_id" INTEGER,
    "related_person_id" INTEGER,
    "relative" TEXT NOT NULL DEFAULT E'',
    "start_date_year" INTEGER,
    "start_date_month" INTEGER,
    "start_date_day" INTEGER,
    "end_date_year" INTEGER,
    "end_date_month" INTEGER,
    "end_date_day" INTEGER,
    "source" INTEGER,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "PersonRelationship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Politic" (
    "id" SERIAL NOT NULL,
    "person" INTEGER,
    "election" INTEGER,
    "desc" TEXT NOT NULL DEFAULT E'',
    "source" TEXT NOT NULL DEFAULT E'',
    "contributer" TEXT NOT NULL DEFAULT E'',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Politic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PoliticProgress" (
    "id" SERIAL NOT NULL,
    "politic" INTEGER,
    "progress" TEXT NOT NULL DEFAULT E'',
    "source" TEXT NOT NULL DEFAULT E'',
    "contributer" TEXT NOT NULL DEFAULT E'',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "PoliticProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lawsuit" (
    "id" SERIAL NOT NULL,
    "person" INTEGER,
    "crime_year" TEXT NOT NULL DEFAULT E'',
    "desc" TEXT NOT NULL DEFAULT E'',
    "source" TEXT NOT NULL DEFAULT E'',
    "contributer" TEXT NOT NULL DEFAULT E'',
    "judge_number" TEXT NOT NULL DEFAULT E'',
    "judge_desc" TEXT NOT NULL DEFAULT E'',
    "judge_content" TEXT NOT NULL DEFAULT E'',
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Lawsuit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_Area_organizations" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Area_children" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Politic_progress" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Post_organization_idx" ON "Post"("organization");

-- CreateIndex
CREATE INDEX "Post_area_idx" ON "Post"("area");

-- CreateIndex
CREATE INDEX "Post_createdBy_idx" ON "Post"("createdBy");

-- CreateIndex
CREATE INDEX "Post_updatedBy_idx" ON "Post"("updatedBy");

-- CreateIndex
CREATE INDEX "Area_parent_idx" ON "Area"("parent");

-- CreateIndex
CREATE INDEX "Area_createdBy_idx" ON "Area"("createdBy");

-- CreateIndex
CREATE INDEX "Area_updatedBy_idx" ON "Area"("updatedBy");

-- CreateIndex
CREATE INDEX "Event_createdBy_idx" ON "Event"("createdBy");

-- CreateIndex
CREATE INDEX "Event_updatedBy_idx" ON "Event"("updatedBy");

-- CreateIndex
CREATE INDEX "Election_createdBy_idx" ON "Election"("createdBy");

-- CreateIndex
CREATE INDEX "Election_updatedBy_idx" ON "Election"("updatedBy");

-- CreateIndex
CREATE INDEX "Vote_pair_idx" ON "Vote"("pair");

-- CreateIndex
CREATE INDEX "Vote_createdBy_idx" ON "Vote"("createdBy");

-- CreateIndex
CREATE INDEX "Vote_updatedBy_idx" ON "Vote"("updatedBy");

-- CreateIndex
CREATE INDEX "Person_createdBy_idx" ON "Person"("createdBy");

-- CreateIndex
CREATE INDEX "Person_updatedBy_idx" ON "Person"("updatedBy");

-- CreateIndex
CREATE INDEX "Motion_createdBy_idx" ON "Motion"("createdBy");

-- CreateIndex
CREATE INDEX "Motion_updatedBy_idx" ON "Motion"("updatedBy");

-- CreateIndex
CREATE INDEX "Organization_createdBy_idx" ON "Organization"("createdBy");

-- CreateIndex
CREATE INDEX "Organization_updatedBy_idx" ON "Organization"("updatedBy");

-- CreateIndex
CREATE INDEX "Collaborate_createdBy_idx" ON "Collaborate"("createdBy");

-- CreateIndex
CREATE INDEX "Collaborate_updatedBy_idx" ON "Collaborate"("updatedBy");

-- CreateIndex
CREATE INDEX "Membership_member_idx" ON "Membership"("member");

-- CreateIndex
CREATE INDEX "Membership_organization_idx" ON "Membership"("organization");

-- CreateIndex
CREATE INDEX "Membership_posts_idx" ON "Membership"("posts");

-- CreateIndex
CREATE INDEX "Membership_area_idx" ON "Membership"("area");

-- CreateIndex
CREATE INDEX "Membership_createdBy_idx" ON "Membership"("createdBy");

-- CreateIndex
CREATE INDEX "Membership_updatedBy_idx" ON "Membership"("updatedBy");

-- CreateIndex
CREATE INDEX "ContactDetail_createdBy_idx" ON "ContactDetail"("createdBy");

-- CreateIndex
CREATE INDEX "ContactDetail_updatedBy_idx" ON "ContactDetail"("updatedBy");

-- CreateIndex
CREATE INDEX "Count_createdBy_idx" ON "Count"("createdBy");

-- CreateIndex
CREATE INDEX "Count_updatedBy_idx" ON "Count"("updatedBy");

-- CreateIndex
CREATE INDEX "OrganizationsElection_organization_id_idx" ON "OrganizationsElection"("organization_id");

-- CreateIndex
CREATE INDEX "OrganizationsElection_createdBy_idx" ON "OrganizationsElection"("createdBy");

-- CreateIndex
CREATE INDEX "OrganizationsElection_updatedBy_idx" ON "OrganizationsElection"("updatedBy");

-- CreateIndex
CREATE INDEX "OrganizationsRelationship_organization_id_idx" ON "OrganizationsRelationship"("organization_id");

-- CreateIndex
CREATE INDEX "OrganizationsRelationship_related_organization_id_idx" ON "OrganizationsRelationship"("related_organization_id");

-- CreateIndex
CREATE INDEX "OrganizationsRelationship_createdBy_idx" ON "OrganizationsRelationship"("createdBy");

-- CreateIndex
CREATE INDEX "OrganizationsRelationship_updatedBy_idx" ON "OrganizationsRelationship"("updatedBy");

-- CreateIndex
CREATE INDEX "PersonElection_person_id_idx" ON "PersonElection"("person_id");

-- CreateIndex
CREATE INDEX "PersonElection_election_idx" ON "PersonElection"("election");

-- CreateIndex
CREATE INDEX "PersonElection_createdBy_idx" ON "PersonElection"("createdBy");

-- CreateIndex
CREATE INDEX "PersonElection_updatedBy_idx" ON "PersonElection"("updatedBy");

-- CreateIndex
CREATE INDEX "PersonOrganization_person_id_idx" ON "PersonOrganization"("person_id");

-- CreateIndex
CREATE INDEX "PersonOrganization_organization_id_idx" ON "PersonOrganization"("organization_id");

-- CreateIndex
CREATE INDEX "PersonOrganization_createdBy_idx" ON "PersonOrganization"("createdBy");

-- CreateIndex
CREATE INDEX "PersonOrganization_updatedBy_idx" ON "PersonOrganization"("updatedBy");

-- CreateIndex
CREATE INDEX "PersonPublication_person_id_idx" ON "PersonPublication"("person_id");

-- CreateIndex
CREATE INDEX "PersonPublication_organization_id_idx" ON "PersonPublication"("organization_id");

-- CreateIndex
CREATE INDEX "PersonPublication_createdBy_idx" ON "PersonPublication"("createdBy");

-- CreateIndex
CREATE INDEX "PersonPublication_updatedBy_idx" ON "PersonPublication"("updatedBy");

-- CreateIndex
CREATE INDEX "PersonRelationship_person_id_idx" ON "PersonRelationship"("person_id");

-- CreateIndex
CREATE INDEX "PersonRelationship_related_person_id_idx" ON "PersonRelationship"("related_person_id");

-- CreateIndex
CREATE INDEX "PersonRelationship_createdBy_idx" ON "PersonRelationship"("createdBy");

-- CreateIndex
CREATE INDEX "PersonRelationship_updatedBy_idx" ON "PersonRelationship"("updatedBy");

-- CreateIndex
CREATE INDEX "Politic_person_idx" ON "Politic"("person");

-- CreateIndex
CREATE INDEX "Politic_election_idx" ON "Politic"("election");

-- CreateIndex
CREATE INDEX "Politic_createdBy_idx" ON "Politic"("createdBy");

-- CreateIndex
CREATE INDEX "Politic_updatedBy_idx" ON "Politic"("updatedBy");

-- CreateIndex
CREATE INDEX "PoliticProgress_politic_idx" ON "PoliticProgress"("politic");

-- CreateIndex
CREATE INDEX "PoliticProgress_createdBy_idx" ON "PoliticProgress"("createdBy");

-- CreateIndex
CREATE INDEX "PoliticProgress_updatedBy_idx" ON "PoliticProgress"("updatedBy");

-- CreateIndex
CREATE INDEX "Lawsuit_person_idx" ON "Lawsuit"("person");

-- CreateIndex
CREATE INDEX "Lawsuit_createdBy_idx" ON "Lawsuit"("createdBy");

-- CreateIndex
CREATE INDEX "Lawsuit_updatedBy_idx" ON "Lawsuit"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "_Area_organizations_AB_unique" ON "_Area_organizations"("A", "B");

-- CreateIndex
CREATE INDEX "_Area_organizations_B_index" ON "_Area_organizations"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Area_children_AB_unique" ON "_Area_children"("A", "B");

-- CreateIndex
CREATE INDEX "_Area_children_B_index" ON "_Area_children"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Politic_progress_AB_unique" ON "_Politic_progress"("A", "B");

-- CreateIndex
CREATE INDEX "_Politic_progress_B_index" ON "_Politic_progress"("B");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_area_fkey" FOREIGN KEY ("area") REFERENCES "Area"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_organization_fkey" FOREIGN KEY ("organization") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Area" ADD CONSTRAINT "Area_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Area" ADD CONSTRAINT "Area_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Area" ADD CONSTRAINT "Area_parent_fkey" FOREIGN KEY ("parent") REFERENCES "Area"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Election" ADD CONSTRAINT "Election_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Election" ADD CONSTRAINT "Election_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_pair_fkey" FOREIGN KEY ("pair") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Person" ADD CONSTRAINT "Person_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Person" ADD CONSTRAINT "Person_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Motion" ADD CONSTRAINT "Motion_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Motion" ADD CONSTRAINT "Motion_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collaborate" ADD CONSTRAINT "Collaborate_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collaborate" ADD CONSTRAINT "Collaborate_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_posts_fkey" FOREIGN KEY ("posts") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_area_fkey" FOREIGN KEY ("area") REFERENCES "Area"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_member_fkey" FOREIGN KEY ("member") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_organization_fkey" FOREIGN KEY ("organization") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactDetail" ADD CONSTRAINT "ContactDetail_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactDetail" ADD CONSTRAINT "ContactDetail_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Count" ADD CONSTRAINT "Count_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Count" ADD CONSTRAINT "Count_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationsElection" ADD CONSTRAINT "OrganizationsElection_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationsElection" ADD CONSTRAINT "OrganizationsElection_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationsElection" ADD CONSTRAINT "OrganizationsElection_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationsRelationship" ADD CONSTRAINT "OrganizationsRelationship_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationsRelationship" ADD CONSTRAINT "OrganizationsRelationship_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationsRelationship" ADD CONSTRAINT "OrganizationsRelationship_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationsRelationship" ADD CONSTRAINT "OrganizationsRelationship_related_organization_id_fkey" FOREIGN KEY ("related_organization_id") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonElection" ADD CONSTRAINT "PersonElection_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonElection" ADD CONSTRAINT "PersonElection_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonElection" ADD CONSTRAINT "PersonElection_election_fkey" FOREIGN KEY ("election") REFERENCES "Election"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonElection" ADD CONSTRAINT "PersonElection_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonOrganization" ADD CONSTRAINT "PersonOrganization_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonOrganization" ADD CONSTRAINT "PersonOrganization_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonOrganization" ADD CONSTRAINT "PersonOrganization_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonOrganization" ADD CONSTRAINT "PersonOrganization_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonPublication" ADD CONSTRAINT "PersonPublication_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonPublication" ADD CONSTRAINT "PersonPublication_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonPublication" ADD CONSTRAINT "PersonPublication_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonPublication" ADD CONSTRAINT "PersonPublication_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonRelationship" ADD CONSTRAINT "PersonRelationship_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonRelationship" ADD CONSTRAINT "PersonRelationship_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonRelationship" ADD CONSTRAINT "PersonRelationship_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonRelationship" ADD CONSTRAINT "PersonRelationship_related_person_id_fkey" FOREIGN KEY ("related_person_id") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Politic" ADD CONSTRAINT "Politic_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Politic" ADD CONSTRAINT "Politic_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Politic" ADD CONSTRAINT "Politic_election_fkey" FOREIGN KEY ("election") REFERENCES "Election"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Politic" ADD CONSTRAINT "Politic_person_fkey" FOREIGN KEY ("person") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoliticProgress" ADD CONSTRAINT "PoliticProgress_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoliticProgress" ADD CONSTRAINT "PoliticProgress_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoliticProgress" ADD CONSTRAINT "PoliticProgress_politic_fkey" FOREIGN KEY ("politic") REFERENCES "Politic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lawsuit" ADD CONSTRAINT "Lawsuit_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lawsuit" ADD CONSTRAINT "Lawsuit_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lawsuit" ADD CONSTRAINT "Lawsuit_person_fkey" FOREIGN KEY ("person") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Area_organizations" ADD FOREIGN KEY ("A") REFERENCES "Area"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Area_organizations" ADD FOREIGN KEY ("B") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Area_children" ADD FOREIGN KEY ("A") REFERENCES "Area"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Area_children" ADD FOREIGN KEY ("B") REFERENCES "Area"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Politic_progress" ADD FOREIGN KEY ("A") REFERENCES "Politic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Politic_progress" ADD FOREIGN KEY ("B") REFERENCES "PoliticProgress"("id") ON DELETE CASCADE ON UPDATE CASCADE;
--
-- PostgreSQL database dump
--

-- Dumped from database version 14.1
-- Dumped by pg_dump version 14.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
