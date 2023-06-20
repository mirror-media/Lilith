import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { text, file, relationship } from '@keystone-6/core/fields'

const { allowRoles, admin, moderator } = utils.accessControl

const listConfigurations = list({
  fields: {
    name: text({
      label: '標題',
      validation: { isRequired: true },
    }),
    youtubeUrl: text({
      label: 'Youtube網址',
    }),
    file: file({
      storage: 'files',
    }),
    coverPhoto: relationship({
      label: '首圖',
      ref: 'Photo',
    }),
    description: text({
      label: '描述',
      ui: {
        displayMode: 'textarea',
      },
    }),
    // todo
    tags: text({
      label: '標籤',
      ui: {
        createView: {
          fieldMode: 'hidden',
        },
        itemView: {
          fieldMode: 'read',
        },
      },
    }),
    meta: text({
      label: '中繼資料',
      ui: {
        createView: {
          fieldMode: 'hidden',
        },
        itemView: {
          fieldMode: 'read',
        },
      },
    }),
    url: text({
      label: '檔案網址',
      ui: {
        createView: {
          fieldMode: 'hidden',
        },
        itemView: {
          fieldMode: 'read',
        },
      },
    }),
    duration: text({
      label: '影片長度（秒）',
      ui: {
        createView: {
          fieldMode: 'hidden',
        },
        itemView: {
          fieldMode: 'read',
        },
      },
    }),
  },

  access: {
    operation: {
      query: () => true,
      update: allowRoles(admin, moderator),
      create: allowRoles(admin, moderator),
      delete: allowRoles(admin),
    },
  },
})

export default utils.addTrackingFields(listConfigurations)
