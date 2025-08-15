import { list } from '@keystone-6/core';
import { text, timestamp, integer, select, relationship, checkbox } from '@keystone-6/core/fields';

const AccountMapping = list({
  access: {
    operation: {
      query: () => true,
      create: () => true,
      update: () => true,
      delete: () => true,
    },
  },
  fields: {
    mesh_member: relationship({
      ref: 'Member',
      many: false,
      isIndexed: true,
    }),
    remote_actor_id: text({
      validation: { isRequired: true },
      isIndexed: true,
    }),
    remote_username: text({
      validation: { isRequired: true },
    }),
    remote_domain: text({
      validation: { isRequired: true },
    }),
    remote_display_name: text(),
    remote_avatar_url: text(),
    remote_summary: text(),
    is_verified: checkbox({
      defaultValue: false,
    }),
    verification_method: select({
      type: 'enum',
      options: [
        { label: 'Manual', value: 'manual' },
        { label: 'Automatic', value: 'automatic' },
        { label: 'WebFinger', value: 'webfinger' },
        { label: 'ActivityPub', value: 'activitypub' },
      ],
    }),
    verification_date: timestamp(),
    sync_enabled: checkbox({
      defaultValue: true,
    }),
    sync_posts: checkbox({
      defaultValue: true,
    }),
    sync_follows: checkbox({
      defaultValue: false,
    }),
    sync_likes: checkbox({
      defaultValue: false,
    }),
    sync_announces: checkbox({
      defaultValue: false,
    }),
    last_sync_at: timestamp(),
    sync_error_count: integer({
      defaultValue: 0,
    }),
    remote_follower_count: integer({
      defaultValue: 0,
    }),
    remote_following_count: integer({
      defaultValue: 0,
    }),
    remote_post_count: integer({
      defaultValue: 0,
    }),
    created_at: timestamp({
      defaultValue: { kind: 'now' },
      validation: { isRequired: true },
    }),
    updated_at: timestamp({
      defaultValue: { kind: 'now' },
      validation: { isRequired: true },
    }),
  },
  ui: {
    listView: {
      initialColumns: ['mesh_member', 'remote_username', 'remote_domain', 'is_verified', 'sync_enabled', 'last_sync_at', 'created_at'],
    },
  },
});

export default AccountMapping;
