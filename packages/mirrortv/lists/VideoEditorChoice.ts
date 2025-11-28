import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { relationship, select, float } from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor, contributor } =
  utils.accessControl

import envVar from '../environment-variables'
import { ACL, UserRole, type Session } from '../type'

// 前端匿名或不同環境的 filter
function filterByServerType(roles: UserRole[]) {
  return ({ session }: { session?: Session }) => {
    switch (envVar.accessControlStrategy) {
      case ACL.GraphQL:
        // 前端網站只顯示已發布或可見項目
        return { state: { in: ['published', 'invisible'] } }
      case ACL.Preview:
        // Preview 顯示全部
        return true
      case ACL.CMS:
      default:
        // CMS 只有登入角色可見
        return (
          session?.data?.role !== undefined && roles.includes(session.data.role)
        )
    }
  }
}

const listConfigurations = list({
  fields: {
    order: float({
      label: '排序順位',
    }),
    videoEditor: relationship({
      label: '精選影音',
      ref: 'Post',
      many: false,
    }),
    state: select({
      label: '狀態',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
        { label: 'Scheduled', value: 'scheduled' },
      ],
      defaultValue: 'draft',
      isIndexed: true,
    }),
  },
  ui: {
    labelField: 'id',
    listView: {
      initialColumns: ['order', 'videoEditor', 'state'],
      initialSort: { field: 'id', direction: 'DESC' },
      pageSize: 50,
    },
  },
  access: {
    operation: {
      query: allowRoles(admin, moderator, editor, contributor),
      update: allowRoles(admin, moderator, editor),
      create: allowRoles(admin, moderator, editor),
      delete: allowRoles(admin, moderator),
    },
    filter: {
      // 針對前端匿名或不同 server type 做過濾
      query: filterByServerType([
        UserRole.Admin,
        UserRole.Moderator,
        UserRole.Editor,
        UserRole.Contributor,
      ]),
    },
  },
  graphql: {
    plural: 'VideoEditorChoices',
    cacheHint: { maxAge: 3600, scope: 'PUBLIC' },
  },
})

export default utils.addTrackingFields(listConfigurations)
