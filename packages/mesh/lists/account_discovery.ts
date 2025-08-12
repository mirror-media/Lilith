import { list } from '@keystone-6/core';
import { text, timestamp, integer, select, relationship, checkbox } from '@keystone-6/core/fields';

const AccountDiscovery = list({
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
    discovery_method: select({
      type: 'enum',
      options: [
        { label: 'WebFinger', value: 'webfinger' },
        { label: 'ActivityPub', value: 'activitypub' },
        { label: 'Search', value: 'search' },
        { label: 'Profile URL', value: 'profile_url' },
        { label: 'Email', value: 'email' },
        { label: 'Auto', value: 'auto' },
      ],
      validation: { isRequired: true },
    }),
    search_query: text({
      validation: { isRequired: true },
    }),
    discovered_actor_id: text({
      validation: { isRequired: true },
    }),
    discovered_username: text({
      validation: { isRequired: true },
    }),
    discovered_domain: text({
      validation: { isRequired: true },
    }),
    discovered_display_name: text(),
    discovered_avatar_url: text(),
    discovered_summary: text(),
    // 與後端 API 對齊
    is_successful: checkbox({ defaultValue: true }),
    // 0-100 信心分數，後端會以百分比整數寫入
    confidence_score: integer({ defaultValue: 80, validation: { isRequired: true, min: 0, max: 100 } }),
    match_reason: text(),
    created_at: timestamp({
      defaultValue: { kind: 'now' },
      validation: { isRequired: true },
    }),
  },
  ui: {
    listView: {
      initialColumns: ['mesh_member', 'discovery_method', 'discovered_username', 'discovered_domain', 'is_successful', 'confidence_score', 'created_at'],
    },
  },
});

export default AccountDiscovery;
