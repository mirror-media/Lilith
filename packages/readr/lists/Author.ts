import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { checkbox, relationship, text, integer } from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    name: text({
      isIndexed: true,
      label: '作者姓名',
      validation: { isRequired: true },
    }),
    name_en: text({
      label: '英文姓名',
    }),
    title: text({
      label: '中文職稱',
    }),
    title_en: text({
      label: '英文職稱',
    }),
    email: text({
      isIndexed: 'unique',
      db: {
        isNullable: true,
      },
    }),
    image: relationship({
      label: '照片',
      ref: 'Photo',
    }),
    homepage: text({
      label: '個人首頁',
      isIndexed: false,
    }),
    sort: integer({
      label: '排序',
    }),
    isMember: checkbox({
      label: '團隊成員',
      isIndexed: true,
    }),
    facebook: text({
      isIndexed: false,
    }),
    twitter: text({
      isIndexed: false,
    }),
    instagram: text({
      isIndexed: true,
    }),
    address: text({
      collapse: 'true',
    }),
    bio: text({
      label: '簡介',
    }),
    posts: relationship({
      ref: 'Post.writers',
      many: true,
      label: '文章',
    }),
    notes: relationship({
      ref: 'ProjectNote.writers',
      many: true,
      label: '文章',
    }),
    quote: relationship({
      ref: 'Quote.writer',
      many: true,
      label: 'Quote',
    }),
    gallery: relationship({
      ref: 'Gallery.writer',
      many: true,
      label: 'Gallery',
    }),
    projects: relationship({
      ref: 'Project.writers',
      many: true,
      label: '專題',
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
