import { customFields, utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import {
  text,
  integer,
  relationship,
  select,
  json,
  timestamp,
  // virtual
} from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

enum Status {
  Published = 'published',
  Draft = 'draft',
  Archived = 'archived',
}

const listConfigurations = list({
  fields: {
    title: text({
      label: '標題',
    }),
    weight: integer({
      label: '權重',
      defaultValue: 85,
      validation: {
        min: 1,
        max: 9999,
      },
    }),
    status: select({
      label: '狀態',
      type: 'enum',
      options: [
        { label: '出版', value: Status.Published },
        { label: '草稿', value: Status.Draft },
        { label: '下架', value: Status.Archived },
      ],
      defaultValue: 'draft',
      ui: {
        displayMode: 'segmented-control',
        listView: {
          fieldMode: 'read',
        },
      },
    }),
    publishDate: timestamp({
      label: '發布日期',
      defaultValue: { kind: 'now' },
    }),
    heroImage: customFields.relationship({
      label: '首圖',
      ref: 'Photo',
      ui: {
        hideCreate: true,
      },
      customConfig: {
        isImage: true,
      },
    }),
    content: customFields.richTextEditor({
      label: '內文',
    }),
    topSpecialfeature: relationship({
      label: '導讀文章（置頂文章）',
      ref: 'Specialfeature',
      many: false,
      ui: {
        labelField: 'title',
      },
    }),
    specialfeatures: relationship({
      label: 'SpecialFeature',
      ref: 'Specialfeature.specialfeatureLists',
      many: true,
      ui: {
        labelField: 'title',
      },
    }),
    manualOrderOfSpecialFeatures: json({
      label: 'SpecialFeature 手動排序結果',
      ui: {
        itemView: {
          fieldMode: 'read',
        },
      },
    }),
    url: text({
      label: '外連網址',
    }),
    section: relationship({
      label: '主分類',
      ref: 'Section.specialfeatureLists',
      ui: {
        hideCreate: true,
      },
      many: true,
    }),
    apiData: json({
      label: '資料庫使用',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      },
    }),
  },
  ui: {
    labelField: 'title',
    listView: {
      initialColumns: ['id', 'title', 'publishDate', 'status'],
      initialSort: { field: 'publishDate', direction: 'DESC' },
      pageSize: 50,
    },
  },
  access: {
    operation: {
      update: () => true,
      // update: allowRoles(admin, moderator, editor),
      create: allowRoles(admin, moderator, editor),
      delete: allowRoles(admin),
    },
  },
  hooks: {
    resolveInput: async ({ resolvedData, item, context }) => {
      const { content } = resolvedData
      if (content) {
        resolvedData.apiData = customFields.draftConverter
          .convertToApiData(content)
          .toJS()
      }

      // For `relationship` field, KeystoneJS won't take user input order into account.
      // Therefore, after the operation is done, the order of `specialfeatures` items maybe not be the same
      // order as the user input order.
      // The following logics records the user input order in `manualOrderOfSpecialFeatures` field.
      //
      // if create/update operation modifies the `specialfeatures` field
      if (resolvedData?.specialfeatures) {
        let currentOrder: { id: string; title: string }[] = []

        // update operation due to `item` not being `undefiend`
        if (item) {
          const previousOrder: { id: string; title: string }[] = Array.isArray(
            item.manualOrderOfSpecialFeatures
          )
            ? item.manualOrderOfSpecialFeatures
            : []

          // user disconnects/removes some `Specialfeature` items.
          const disconnectIds =
            resolvedData.specialfeatures?.disconnect?.map(
              (obj: { id: number }) => obj.id.toString()
            ) || []

          // filtered out to-be-disconnected `Specialfeature` items
          currentOrder = previousOrder.filter(({ id }: { id: string }) => {
            return disconnectIds.indexOf(id) === -1
          })
        }

        // user connects/adds some `Specialfeature` item.
        const connectedIds =
          resolvedData.specialfeatures?.connect?.map((obj: { id: number }) =>
            obj.id.toString()
          ) || []

        if (connectedIds.length > 0) {
          // Query `Specialfetaure` items from the database.
          // Therefore, we can have other fields such as `title`, etc.
          const sfToConnect = await context.db.Specialfeature.findMany({
            where: { id: { in: connectedIds } },
          })

          // Database query results are not sorted.
          // We need to sort them by ourselves.
          for (let i = 0; i < connectedIds.length; i++) {
            const sf = sfToConnect.find((obj) => {
              return `${obj.id}` === connectedIds[i]
            })
            if (sf) {
              currentOrder.push({
                id: sf.id.toString(),
                title: typeof sf.title === 'string' ? sf.title : '',
              })
            }
          }
        }

        // records the order of `specialfeatures`
        resolvedData.manualOrderOfSpecialFeatures = currentOrder
      }

      return resolvedData
    },
    validateInput: async ({
      operation,
      item,
      resolvedData,
      addValidationError,
    }) => {
      // publishDate is must while status is not `draft`
      if (operation == 'create') {
        const { status } = resolvedData
        if (status && status != 'draft') {
          const { publishDate } = resolvedData
          if (!publishDate) {
            addValidationError('需要填入發布時間')
          }
        }
      }
      if (operation == 'update') {
        if (resolvedData.status && resolvedData.status != 'draft') {
          const publishDate = resolvedData.publishDate || item.publishDate
          if (!publishDate) {
            addValidationError('需要填入發布時間')
          }
        } else if (resolvedData.publishDate === null) {
          const status = resolvedData.status || item.status
          if (status != 'draft') {
            addValidationError('需要填入發布時間')
          }
        }
      }
    },
  },
})

export default utils.addTrackingFields(listConfigurations)
