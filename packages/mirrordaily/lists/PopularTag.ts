import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { relationship, integer,} from '@keystone-6/core/fields'
import { State } from '../type'

const { allowRoles, admin, moderator, editor } = utils.accessControl

enum EditorChoiceState {
  Draft = State.Draft,
  Published = State.Published,
  Scheduled = State.Scheduled,
  Archived = State.Archived,
}

const listConfigurations = list({
  fields: {
    order: integer({
      label: '排序',
      isIndexed: 'unique',
      validation: {
        min: 1,
        max: 9999,
      },
    }),
    choices: relationship({
      label: '熱門標籤',
      ref: 'Tag',
      many: false,
      ui: {
        views: './lists/views/sorted-relationship/index',
        labelField: 'name',
      },
    }),
  },
  ui: {
    labelField: 'id',
    listView: {
      initialColumns: ['id', 'order', 'choices'],
      initialSort: { field: 'id', direction: 'DESC' },
      pageSize: 50,
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
export default utils.addTrackingFields(listConfigurations)
