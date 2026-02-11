import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { select, integer, text } from '@keystone-6/core/fields'
import envVar from '../environment-variables'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    name: text({
      label: '影片名稱',
      validation: { isRequired: true },
    }),
    sortOrder: integer({
      label: '排序順位',
      isIndexed: 'unique',
    }),
    ytUrl: text({
      label: 'Youtube影片',
      validation: { isRequired: true },
    }),
    state: select({
      label: '狀態',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
        { label: 'Scheduled', value: 'scheduled' },
      ],
      defaultValue: 'draft',
    }),
  },
  access: {
    operation: {
      query: () => true,
      update: allowRoles(admin, moderator, editor),
      create: allowRoles(admin, moderator, editor),
      delete: allowRoles(admin, moderator),
    },
  },
  ui: {
    labelField: 'name',
    listView: {
      initialColumns: ['name', 'sortOrder', 'state'],
      initialSort: { field: 'sortOrder', direction: 'DESC' },
      pageSize: 50,
    },
  },
  hooks: {
    afterOperation: async ({ operation, item, originalItem }) => {
      // Only trigger on create or update operations
      if (operation !== 'create' && operation !== 'update') return
      const wasPublished = originalItem?.state === 'published'
      const isPublished = item?.state === 'published'
      if (wasPublished || isPublished) {
        console.log(
          `[Hook] PromotionVideo "${item.name}" published status changed, triggering JSON regeneration`
        )

        try {
          const dataServiceApi = `${envVar.dataServiceApi}/jobs/homepage-video/generate`
          const response = await fetch(dataServiceApi, { method: 'POST' })

          if (response.ok) {
            console.log(
              '[Hook] Video JSON updated successfully via PromotionVideo'
            )
          } else {
            console.error('[Hook] Video JSON update failed:', response.status)
          }
        } catch (error) {
          console.error('[Hook] Failed to trigger video JSON update:', error)
        }
      }
    },
  },
})

export default utils.addTrackingFields(listConfigurations)
