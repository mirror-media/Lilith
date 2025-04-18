import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { select, text, timestamp, relationship } from '@keystone-6/core/fields'
import envVar from '../environment-variables'
import { ACL, UserRole, State, type Session } from '../type'

const { allowRoles, admin, moderator } = utils.accessControl

enum ExternalStatus {
  Published = State.Published,
  Draft = State.Draft,
  Scheduled = State.Scheduled,
  Archived = State.Archived,
  Invisible = State.Invisible,
}

function filterExternals(roles: string[]) {
  return ({ session }: { session: Session }) => {
    switch (envVar.accessControlStrategy) {
      case ACL.GraphQL: {
        // Expose `published` and `invisible` externals
        return {
          state: { in: [ExternalStatus.Published, ExternalStatus.Invisible] },
        }
      }
      case ACL.Preview: {
        // Expose all externals
        return true
      }
      case ACL.CMS:
      default: {
        // Expose all externals if user logged in
        return roles.indexOf(session?.data?.role) > -1
      }
    }
  }
}

const listConfigurations = list({
  fields: {
    // TODO: slug field is deprecated, should be removed in the future
    slug: text({
      label: 'slug',
      isFilterable: false,
      isOrderable: false,
      ui: {
        createView: { fieldMode: 'hidden' },
        listView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
    }),
    partner: relationship({
      ref: 'Partner',
      ui: {
        hideCreate: true,
      },
    }),
    title: text({
      label: '標題',
      validation: { isRequired: true },
    }),
    state: select({
      label: '狀態',
      options: [
        { label: '草稿', value: ExternalStatus.Draft },
        { label: '已發布', value: ExternalStatus.Published },
        { label: '預約發佈', value: ExternalStatus.Scheduled },
        { label: '下線', value: ExternalStatus.Archived },
        { label: '前台不可見', value: ExternalStatus.Invisible },
      ],
      defaultValue: ExternalStatus.Draft,
      isIndexed: true,
    }),
    publishedDate: timestamp({
      label: '發佈日期',
      isIndexed: true,
    }),
    publishedDateString: text({
      label: '發布日期',
      ui: {
        createView: {
          fieldMode: 'hidden',
        },
        itemView: {
          fieldMode: 'hidden',
        },
      },
    }),
    extend_byline: text({
      label: '作者',
      validation: { isRequired: false },
    }),
    thumb: text({
      label: '圖片網址',
      validation: { isRequired: false },
    }),

    brief: text({
      label: '前言',
      ui: { displayMode: 'textarea' },
    }),
    content: text({
      label: '內文',
      ui: { displayMode: 'textarea' },
    }),
    source: text({
      label: '原文網址',
      validation: { isRequired: false },
    }),
    tags: relationship({
      label: '標籤',
      ref: 'Tag.externals',
      many: true,
      ui: {
        views: './lists/views/sorted-relationship/index',
      },
    }),
    relateds: relationship({
      label: '相關內部文章',
      ref: 'Post.from_External_relateds',
      many: true,
      ui: {
        views: './lists/views/sorted-relationship-filter-draft-selfpost/index',
      },
    }),
    groups: relationship({
      label: '群組',
      ref: 'Group.externals',
      many: true,
      ui: {
        views: './lists/views/sorted-relationship/index',
      },
    }),
  },
  ui: {
    labelField: 'title',
    listView: {
      initialColumns: ['id', 'title', 'partner', 'publishedDateString'],
      initialSort: { field: 'id', direction: 'DESC' },
      pageSize: 50,
    },
  },
  access: {
    operation: {
      query: () => true,
      update: allowRoles(admin, moderator),
      create: allowRoles(admin, moderator),
      delete: allowRoles(admin, moderator),
    },
    filter: {
      query: filterExternals([
        UserRole.Admin,
        UserRole.Moderator,
        UserRole.Editor,
      ]),
    },
  },
  hooks: {
    beforeOperation: async ({ operation, resolvedData }) => {
      /* ... */
      if (operation === 'create' || operation === 'update') {
        if (resolvedData.publishedDate) {
          resolvedData.publishedDateString = new Date(
            resolvedData.publishedDate
          ).toLocaleDateString('zh-TW', {
            timeZone: 'Asia/Taipei',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          })
          return
        }
      }
      return
    },
  },
})
export default utils.addTrackingFields(listConfigurations)
