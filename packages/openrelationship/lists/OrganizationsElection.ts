import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { relationship, text, integer } from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    organization_id: relationship({
      label: '組織名稱',
      many: false,
      ref: 'Organization',
    }),
    election_year_year: integer({ label: '選舉年' }),
    election_year_month: integer({ label: '選舉月' }),
    election_year_day: integer({ label: '選舉日' }),
    // election_name: { label: "選舉名稱", type: Text },

    number: text({ label: '號次' }),
    votes_obtained_number: text({ label: '得票數' }),
    first_obtained_number: text({
      label: '第一階段得票率',
      db: {
        isNullable: true,
      },
    }),
    second_obtained_number: text({
      label: '第二階段得票率',
      db: {
        isNullable: true,
      },
    }),
    seats: text({ label: '分配席次' }),
    source: text({ label: '資料來源' }),
    elections: relationship({
      label: '選舉',
      ref: 'Election.organizationsElection',
    }),
    politics: relationship({
      label: '政見',
      many: true,
      ref: 'Politic.organization',
      ui: {
        displayMode: 'cards',
        cardFields: [
          'desc',
          'content',
          'source',
          'contributer',
          'status',
          'thread_parent',
          'tag',
          'reviewed',
        ],
        inlineCreate: {
          fields: [
            'desc',
            'content',
            'source',
            'contributer',
            'status',
            'thread_parent',
            'tag',
            'reviewed',
          ],
        },
        inlineEdit: {
          fields: [
            'desc',
            'content',
            'source',
            'contributer',
            'status',
            'thread_parent',
            'tag',
            'reviewed',
          ],
        },
        linkToItem: true,
      },
    }),
  },
  access: {
    operation: {
      query: allowRoles(admin, moderator, editor),
      update: allowRoles(admin, moderator),
      create: allowRoles(admin, moderator),
      delete: allowRoles(admin),
    },
  },
})
export default utils.addTrackingFields(listConfigurations)
