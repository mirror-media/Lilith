-- CreateEnum
CREATE TYPE "ActivityActivityTypeType" AS ENUM ('Create', 'Like', 'Announce', 'Follow');

-- CreateEnum
CREATE TYPE "FederationConnectionConnectionTypeType" AS ENUM ('http', 'https');

-- CreateEnum
CREATE TYPE "FederationConnectionDirectionType" AS ENUM ('inbound', 'outbound');

-- CreateEnum
CREATE TYPE "FederationConnectionStatusType" AS ENUM ('pending', 'success', 'failed');

-- CreateEnum
CREATE TYPE "AccountDiscoveryDiscoveryMethodType" AS ENUM ('webfinger', 'activitypub', 'search', 'profile_url', 'email', 'auto');

-- CreateEnum
CREATE TYPE "AccountDiscoveryIsSuccessfulType" AS ENUM ('success', 'failed');

-- CreateEnum
CREATE TYPE "AccountMappingVerificationMethodType" AS ENUM ('manual', 'automatic', 'webfinger', 'activitypub');

-- CreateEnum
CREATE TYPE "AccountSyncTaskSyncTypeType" AS ENUM ('posts', 'follows', 'likes', 'announces', 'profile');

-- CreateEnum
CREATE TYPE "AccountSyncTaskStatusType" AS ENUM ('pending', 'running', 'completed', 'failed', 'cancelled');

-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "activitypub_auto_follow" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "activitypub_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "activitypub_federation_enabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "activitypub_public_posts" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Publisher" ADD COLUMN     "youtube_url" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "ActivityPubActor" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL DEFAULT '',
    "domain" TEXT NOT NULL DEFAULT '',
    "display_name" TEXT NOT NULL DEFAULT '',
    "summary" TEXT NOT NULL DEFAULT '',
    "icon_url" TEXT NOT NULL DEFAULT '',
    "inbox_url" TEXT NOT NULL DEFAULT '',
    "outbox_url" TEXT NOT NULL DEFAULT '',
    "followers_url" TEXT NOT NULL DEFAULT '',
    "following_url" TEXT NOT NULL DEFAULT '',
    "public_key_pem" TEXT NOT NULL DEFAULT '',
    "private_key_pem" TEXT NOT NULL DEFAULT '',
    "is_local" BOOLEAN NOT NULL DEFAULT true,
    "mesh_member" INTEGER,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "ActivityPubActor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" SERIAL NOT NULL,
    "activity_id" TEXT NOT NULL DEFAULT '',
    "activity_type" "ActivityActivityTypeType",
    "actor" INTEGER,
    "object_data" JSONB,
    "target_data" JSONB,
    "to" JSONB,
    "cc" JSONB,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InboxItem" (
    "id" SERIAL NOT NULL,
    "activity_id" TEXT NOT NULL DEFAULT '',
    "actor_id" TEXT NOT NULL DEFAULT '',
    "activity_data" JSONB,
    "is_processed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "InboxItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutboxItem" (
    "id" SERIAL NOT NULL,
    "activity_id" TEXT NOT NULL DEFAULT '',
    "actor" INTEGER,
    "activity_data" JSONB,
    "is_delivered" BOOLEAN NOT NULL DEFAULT false,
    "delivery_attempts" INTEGER DEFAULT 0,
    "delivered_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "OutboxItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FederationInstance" (
    "id" SERIAL NOT NULL,
    "domain" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "software" TEXT NOT NULL DEFAULT '',
    "version" TEXT NOT NULL DEFAULT '',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "is_blocked" BOOLEAN NOT NULL DEFAULT false,
    "last_seen" TIMESTAMP(3),
    "last_successful_connection" TIMESTAMP(3),
    "user_count" INTEGER DEFAULT 0,
    "post_count" INTEGER DEFAULT 0,
    "connection_count" INTEGER DEFAULT 0,
    "error_count" INTEGER DEFAULT 0,
    "auto_follow" BOOLEAN NOT NULL DEFAULT false,
    "auto_announce" BOOLEAN NOT NULL DEFAULT true,
    "max_followers" INTEGER DEFAULT 1000,
    "max_following" INTEGER DEFAULT 1000,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "FederationInstance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FederationConnection" (
    "id" SERIAL NOT NULL,
    "instance" INTEGER,
    "connection_type" "FederationConnectionConnectionTypeType",
    "direction" "FederationConnectionDirectionType",
    "source_actor" TEXT NOT NULL DEFAULT '',
    "target_actor" TEXT NOT NULL DEFAULT '',
    "activity_id" TEXT NOT NULL DEFAULT '',
    "status" "FederationConnectionStatusType",
    "error_message" TEXT NOT NULL DEFAULT '',
    "processed_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "FederationConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountDiscovery" (
    "id" SERIAL NOT NULL,
    "mesh_member" INTEGER,
    "discovery_method" "AccountDiscoveryDiscoveryMethodType" NOT NULL,
    "search_query" TEXT NOT NULL DEFAULT '',
    "discovered_actor_id" TEXT NOT NULL DEFAULT '',
    "discovered_username" TEXT NOT NULL DEFAULT '',
    "discovered_domain" TEXT NOT NULL DEFAULT '',
    "discovered_display_name" TEXT NOT NULL DEFAULT '',
    "discovered_avatar_url" TEXT NOT NULL DEFAULT '',
    "discovered_summary" TEXT NOT NULL DEFAULT '',
    "is_successful" "AccountDiscoveryIsSuccessfulType" NOT NULL DEFAULT 'success',
    "confidence_score" INTEGER NOT NULL DEFAULT 80,
    "match_reason" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccountDiscovery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountMapping" (
    "id" SERIAL NOT NULL,
    "mesh_member" INTEGER,
    "remote_actor_id" TEXT NOT NULL DEFAULT '',
    "remote_username" TEXT NOT NULL DEFAULT '',
    "remote_domain" TEXT NOT NULL DEFAULT '',
    "remote_display_name" TEXT NOT NULL DEFAULT '',
    "remote_avatar_url" TEXT NOT NULL DEFAULT '',
    "remote_summary" TEXT NOT NULL DEFAULT '',
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "verification_method" "AccountMappingVerificationMethodType",
    "verification_date" TIMESTAMP(3),
    "sync_enabled" BOOLEAN NOT NULL DEFAULT true,
    "sync_posts" BOOLEAN NOT NULL DEFAULT true,
    "sync_follows" BOOLEAN NOT NULL DEFAULT false,
    "sync_likes" BOOLEAN NOT NULL DEFAULT false,
    "sync_announces" BOOLEAN NOT NULL DEFAULT false,
    "last_sync_at" TIMESTAMP(3),
    "sync_error_count" INTEGER DEFAULT 0,
    "remote_follower_count" INTEGER DEFAULT 0,
    "remote_following_count" INTEGER DEFAULT 0,
    "remote_post_count" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccountMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountSyncTask" (
    "id" SERIAL NOT NULL,
    "mapping" INTEGER,
    "sync_type" "AccountSyncTaskSyncTypeType" NOT NULL,
    "status" "AccountSyncTaskStatusType" NOT NULL DEFAULT 'pending',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "items_processed" INTEGER DEFAULT 0,
    "items_synced" INTEGER DEFAULT 0,
    "items_failed" INTEGER DEFAULT 0,
    "since_date" TIMESTAMP(3),
    "max_items" INTEGER DEFAULT 100,
    "error_message" TEXT NOT NULL DEFAULT '',
    "retry_count" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "AccountSyncTask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ActivityPubActor_username_key" ON "ActivityPubActor"("username");

-- CreateIndex
CREATE INDEX "ActivityPubActor_mesh_member_idx" ON "ActivityPubActor"("mesh_member");

-- CreateIndex
CREATE INDEX "ActivityPubActor_createdBy_idx" ON "ActivityPubActor"("createdBy");

-- CreateIndex
CREATE INDEX "ActivityPubActor_updatedBy_idx" ON "ActivityPubActor"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "Activity_activity_id_key" ON "Activity"("activity_id");

-- CreateIndex
CREATE INDEX "Activity_actor_idx" ON "Activity"("actor");

-- CreateIndex
CREATE INDEX "Activity_createdBy_idx" ON "Activity"("createdBy");

-- CreateIndex
CREATE INDEX "Activity_updatedBy_idx" ON "Activity"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "InboxItem_activity_id_key" ON "InboxItem"("activity_id");

-- CreateIndex
CREATE INDEX "InboxItem_createdBy_idx" ON "InboxItem"("createdBy");

-- CreateIndex
CREATE INDEX "InboxItem_updatedBy_idx" ON "InboxItem"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "OutboxItem_activity_id_key" ON "OutboxItem"("activity_id");

-- CreateIndex
CREATE INDEX "OutboxItem_actor_idx" ON "OutboxItem"("actor");

-- CreateIndex
CREATE INDEX "OutboxItem_createdBy_idx" ON "OutboxItem"("createdBy");

-- CreateIndex
CREATE INDEX "OutboxItem_updatedBy_idx" ON "OutboxItem"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "FederationInstance_domain_key" ON "FederationInstance"("domain");

-- CreateIndex
CREATE INDEX "FederationInstance_createdBy_idx" ON "FederationInstance"("createdBy");

-- CreateIndex
CREATE INDEX "FederationInstance_updatedBy_idx" ON "FederationInstance"("updatedBy");

-- CreateIndex
CREATE INDEX "FederationConnection_instance_idx" ON "FederationConnection"("instance");

-- CreateIndex
CREATE INDEX "FederationConnection_createdBy_idx" ON "FederationConnection"("createdBy");

-- CreateIndex
CREATE INDEX "FederationConnection_updatedBy_idx" ON "FederationConnection"("updatedBy");

-- CreateIndex
CREATE INDEX "AccountDiscovery_mesh_member_idx" ON "AccountDiscovery"("mesh_member");

-- CreateIndex
CREATE INDEX "AccountMapping_mesh_member_idx" ON "AccountMapping"("mesh_member");

-- CreateIndex
CREATE INDEX "AccountMapping_remote_actor_id_idx" ON "AccountMapping"("remote_actor_id");

-- CreateIndex
CREATE INDEX "AccountSyncTask_mapping_idx" ON "AccountSyncTask"("mapping");

-- AddForeignKey
ALTER TABLE "ActivityPubActor" ADD CONSTRAINT "ActivityPubActor_mesh_member_fkey" FOREIGN KEY ("mesh_member") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityPubActor" ADD CONSTRAINT "ActivityPubActor_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityPubActor" ADD CONSTRAINT "ActivityPubActor_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_actor_fkey" FOREIGN KEY ("actor") REFERENCES "ActivityPubActor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InboxItem" ADD CONSTRAINT "InboxItem_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InboxItem" ADD CONSTRAINT "InboxItem_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutboxItem" ADD CONSTRAINT "OutboxItem_actor_fkey" FOREIGN KEY ("actor") REFERENCES "ActivityPubActor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutboxItem" ADD CONSTRAINT "OutboxItem_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutboxItem" ADD CONSTRAINT "OutboxItem_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FederationInstance" ADD CONSTRAINT "FederationInstance_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FederationInstance" ADD CONSTRAINT "FederationInstance_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FederationConnection" ADD CONSTRAINT "FederationConnection_instance_fkey" FOREIGN KEY ("instance") REFERENCES "FederationInstance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FederationConnection" ADD CONSTRAINT "FederationConnection_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FederationConnection" ADD CONSTRAINT "FederationConnection_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountDiscovery" ADD CONSTRAINT "AccountDiscovery_mesh_member_fkey" FOREIGN KEY ("mesh_member") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountMapping" ADD CONSTRAINT "AccountMapping_mesh_member_fkey" FOREIGN KEY ("mesh_member") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountSyncTask" ADD CONSTRAINT "AccountSyncTask_mapping_fkey" FOREIGN KEY ("mapping") REFERENCES "AccountMapping"("id") ON DELETE SET NULL ON UPDATE CASCADE;
