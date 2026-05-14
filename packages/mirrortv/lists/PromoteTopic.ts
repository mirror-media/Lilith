import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { relationship, select, integer } from '@keystone-6/core/fields'
import { State } from '../type'
import envVar from '../environment-variables'
const { allowRoles, admin, moderator, editor } = utils.accessControl

enum PromoteTopicState {
  Draft = State.Draft,
  Published = State.Published,
  Archived = State.Archived,
}
const MAX_PUBLISHED_ITEMS = 3

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
    topics: relationship({
      label: '精選專題',
      ref: 'Topic',
      ui: {
        views: './lists/views/sorted-relationship/index',
        labelField: 'name',
      },
    }),
    state: select({
      label: '狀態',
      options: [
        { label: '草稿', value: PromoteTopicState.Draft },
        { label: '已上線', value: PromoteTopicState.Published },
        { label: '已下線', value: PromoteTopicState.Archived },
      ],
      defaultValue: PromoteTopicState.Draft,
      isIndexed: true,
    }),
  },
  ui: {
    labelField: 'id',
    listView: {
      initialColumns: ['id', 'order', 'topics', 'state'],
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
  hooks: {
    validateInput: async ({
      resolvedData,
      addValidationError,
      context,
      item,
    }) => {
      const { order } = resolvedData || {}
      if (order !== undefined && order !== null) {
        const existingCount = await context.query.PromoteTopic.count({
          where: {
            order: { equals: order },
            id: { not: { equals: item?.id } },
          },
        })
        if (existingCount > 0) {
          addValidationError(`Order ${order} is already in use.`)
        }
      }
    },

    // 只能有三個 topic 是已上線狀態的
    beforeOperation: async ({ operation, resolvedData, item, context }) => {
      const { state: newState } = resolvedData || {}
      const oldState = item?.state

      const isTurningPublished =
        (operation === 'create' && newState === PromoteTopicState.Published) ||
        (operation === 'update' &&
          newState === PromoteTopicState.Published &&
          oldState !== PromoteTopicState.Published)

      if (isTurningPublished) {
        const publishedItems = await context.query.PromoteTopic.findMany({
          where: { state: { equals: PromoteTopicState.Published } },
          orderBy: { updatedAt: 'asc' },
          query: 'id',
        })

        if (publishedItems.length >= MAX_PUBLISHED_ITEMS) {
          const numToArchive = publishedItems.length + 1 - MAX_PUBLISHED_ITEMS
          const itemsToArchive = publishedItems.slice(
            0,
            Math.max(0, numToArchive)
          )

          if (itemsToArchive.length > 0) {
            await context.prisma.promoteTopic.updateMany({
              where: {
                id: {
                  in: itemsToArchive.map((i) => Number(i.id)),
                },
              },
              data: {
                state: PromoteTopicState.Archived,
              },
            })

            console.log(
              `[PromoteTopic] Batch archived IDs: ${itemsToArchive
                .map((i) => i.id)
                .join(', ')}`
            )
          }
        }
      }
    },
    afterOperation: async ({ item, originalItem }) => {
      const wasPublished = originalItem?.state === PromoteTopicState.Published
      const isPublished = item?.state === PromoteTopicState.Published

      if (wasPublished || isPublished) {
        const promoteTopicSyncUrl = envVar.promoteTopicServiceUrl

        if (promoteTopicSyncUrl) {
          try {
            const res = await fetch(promoteTopicSyncUrl, {
              method: 'POST',
            })

            if (res.ok) {
              console.log('[Promote Topic Sync] Triggered update successfully.')
            } else {
              const errorMsg = await res.text()
              console.error(
                `[Promote Topic Sync] HTTP Error: ${res.status}, Message: ${errorMsg}`
              )
            }
          } catch (err) {
            console.error('[Promote Topic Sync] Fetch Error:', err)
          }
        }
      }
    },
  },
})
export default utils.addTrackingFields(listConfigurations)
