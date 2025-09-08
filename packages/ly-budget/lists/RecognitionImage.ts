import { list } from '@keystone-6/core'
import { utils } from '@mirrormedia/lilith-core'
import { integer, relationship, select, text } from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    meeting: relationship({
      label: '會議',
      ref: 'Meeting',
      ui: {
        labelField: 'displayName',
      },
    }),
    imageUrl: text({
      label: '圖片 url',
      validation: { isRequired: true },
    }),
    pageNumber: integer({
      label: '頁數',
      db: {
        isNullable: true,
      },
    }),
    government: relationship({
      label: '部會',
      ref: 'Government',
    }),
    historicalProposals: relationship({
      label: '歷史子提案單',
      many: true,
      ref: 'Proposal',
    }),
    mergedProposals: relationship({
      label: '併案子提案單',
      many: true,
      ref: 'Proposal',
    }),
    verificationStatus: select({
      label: '驗證狀態',
      options: [
        { value: 'verified', label: '已驗證' },
        { value: 'not_verified', label: '未驗證' },
      ],
      defaultValue: 'not_verified',
      isIndexed: true,
    }),
    description: text({
      label: '說明',
      db: {
        isNullable: true,
      },
      ui: {
        displayMode: 'textarea',
      },
    }),
  },

  ui: {
    listView: {
      initialColumns: ['meeting', 'imageUrl', 'pageNumber', 'government', 'verificationStatus'],
    },
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

export default listConfigurations
