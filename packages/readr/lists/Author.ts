// @ts-ignore: no definition
import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import {
  checkbox,
  select,
  relationship,
  text,
  integer,
} from '@keystone-6/core/fields'

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
    title: select({
      label: '中文職稱',
      options: [
        { label: '總編輯', value: 'editor in chief' },
        { label: '產品經理', value: 'product manager' },
        { label: '設計師', value: 'product designer' },
        { label: '記者', value: 'journalist' },
        { label: '社群', value: 'social media editor' },
        { label: '前端工程師', value: 'front-end engineer' },
        { label: '後端工程師', value: 'back-end engineer' },
        { label: '全端工程師', value: 'full-stack engineer' },
        { label: '專題製作人', value: 'Feature Producer' },
        { label: 'App工程師', value: 'App engineer' },
      ],
      defaultValue: 'journalist',
    }),
    title_en: select({
      label: '英文職稱',
      options: [
        { label: '總編輯', value: 'editor in chief' },
        { label: '產品經理', value: 'product manager' },
        { label: '設計師', value: 'product designer' },
        { label: '記者', value: 'journalist' },
        { label: '社群', value: 'social media editor' },
        { label: '前端工程師', value: 'front-end engineer' },
        { label: '後端工程師', value: 'back-end engineer' },
        { label: '全端工程師', value: 'full-stack engineer' },
        { label: '專題製作人', value: 'Feature Producer' },
        { label: 'App工程師', value: 'App engineer' },
      ],
      defaultValue: 'journalist',
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
      isIndexed: undefined,
    }),
    sort: integer({
      label: '排序',
    }),
    isMember: checkbox({
      label: '團隊成員',
    }),
    special_number: text({
      label: '數字',
    }),
    number_desc: text({
      label: '數字說明（中文）',
    }),
    number_desc_en: text({
      label: '數字說明（英文）',
    }),
    facebook: text({
      isIndexed: undefined,
    }),
    twitter: text({
      isIndexed: undefined,
    }),
    instagram: text({
      isIndexed: true,
    }),
    address: text({}),
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
