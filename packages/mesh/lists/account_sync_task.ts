import { list } from '@keystone-6/core';
import { text, timestamp, integer, select, relationship } from '@keystone-6/core/fields';

const AccountSyncTask = list({
  access: {
    operation: {
      query: () => true,
      create: () => true,
      update: () => true,
      delete: () => true,
    },
  },
  fields: {
    mapping: relationship({
      ref: 'AccountMapping',
      many: false,
      isIndexed: true,
    }),
    sync_type: select({
      type: 'enum',
      options: [
        { label: 'Posts', value: 'posts' },
        { label: 'Follows', value: 'follows' },
        { label: 'Likes', value: 'likes' },
        { label: 'Announces', value: 'announces' },
        { label: 'Profile', value: 'profile' },
      ],
      validation: { isRequired: true },
    }),
    status: select({
      type: 'enum',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Running', value: 'running' },
        { label: 'Completed', value: 'completed' },
        { label: 'Failed', value: 'failed' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      defaultValue: 'pending',
      validation: { isRequired: true },
    }),
    progress: integer({
      defaultValue: 0,
      validation: { isRequired: true, min: 0, max: 100 },
    }),
    items_processed: integer({
      defaultValue: 0,
    }),
    items_synced: integer({
      defaultValue: 0,
    }),
    items_failed: integer({
      defaultValue: 0,
    }),
    since_date: timestamp(),
    max_items: integer({
      defaultValue: 100,
    }),
    error_message: text(),
    retry_count: integer({
      defaultValue: 0,
    }),
    created_at: timestamp({
      defaultValue: { kind: 'now' },
      validation: { isRequired: true },
    }),
    started_at: timestamp(),
    completed_at: timestamp(),
  },
  ui: {
    listView: {
      initialColumns: ['mapping', 'sync_type', 'status', 'progress', 'items_synced', 'created_at', 'started_at'],
    },
  },
});

export default AccountSyncTask;
