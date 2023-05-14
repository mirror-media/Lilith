import { BaseItem } from '@keystone-6/core/types'
import { ListConfig, graphql } from '@keystone-6/core'
import { json, virtual } from '@keystone-6/core/fields'

type ManualOrderFieldConfig = {
  fieldName: string
  fieldLabel?: string
  targetFieldName: string
  targetListName: string
  targetListLabelField: string
}

/**
 * For `relationship` field, KeystoneJS won't take user input order into account.
 * Therefore, after the create/update operation is done,
 * the order of relationship items maybe not be the same order as the user input order.
 *
 * This function
 * - adds monitoring fields in the list
 * - adds virtual fields in the list. These virtual fields could return relationship items in order.
 * - decorate `list.hooks.resolveInput` to record the user input order in the monitoring fields
 *
 * For example, if we have two lists like
 *  ```
 *  const User = {
 *    fields: {
 *      name: text(),
 *    }
 *  }
 *
 *  const Post = {
 *    fields: {
 *      title: text(),
 *      content: text(),
 *      authors: relationship({ref: 'User', many: true})
 *    }
 *  }
 *  ```
 *
 *  if we want to snapshot the authors input order, we can use this function like
 *  ```
 *  const postList = addManualOrderRelationshipFields([
 *    {
 *      fieldName: 'manualOrderOfAuthors',
 *      fieldLabel: 'authors 手動排序結果',
 *      targetFieldName: 'authors', // the target field to record the user input order
 *      targetListName: 'User', // relationship list name
 *      targetListLabelField: 'name', // refer to `User.fields.name`
 *    }
 *  ])(Post)
 *  ```
 *
 *  `addManualOrderRelationshipFields` will create another JSON field `manualOrderOfAuthors` and virtual field `authorsInInputOrder` in the list,
 *  and decorate `list.hooks.resolveInput` to record the update/create operation,
 *  if the operation modifies the order of the relationship field.
 *
 *  `authorsInInputOrder` is a virtual field, which means its value is computed on-the-fly, not stored in the database. This virtual field combines relationship field `authors` and monitoring field `manualOrderOfAuthors` to sort the authors in specific input order.
 */
function addManualOrderRelationshipFields(
  manualOrderFields: ManualOrderFieldConfig[] = [],
  list: ListConfig<any, any>
) {
  manualOrderFields.forEach((mo) => {
    if (!list.fields?.[mo.fieldName]) {
      list.fields[mo.fieldName] = json({
        label: mo.fieldLabel,
        ui: {
          itemView: {
            fieldMode: 'read',
          },
        },
      })
    }

    // add virtual field definition
    addVirtualFieldToReturnItemsInInputOrder(list, mo)
  })

  // decorate `resolveInput` hook
  list.hooks = list.hooks || {}
  const originResolveInput = list.hooks?.resolveInput
  list.hooks.resolveInput = async (props) => {
    let resolvedData = props.resolvedData

    if (typeof originResolveInput === 'function') {
      resolvedData = await originResolveInput(props)
    }

    const { item, context } = props

    // check if create/update item has the fields
    // we want to monitor
    for (let i = 0; i < manualOrderFields.length; i++) {
      const {
        targetFieldName,
        fieldName,
        targetListName,
        targetListLabelField,
      } = manualOrderFields[i]

      // if create/update operation creates/modifies the `${targetFieldName}` field
      if (resolvedData?.[targetFieldName]) {
        let currentOrder: { id: string }[] = []

        // update operation due to `item` not being `undefiend`
        if (item) {
          const previousOrder: { id: string }[] = Array.isArray(item[fieldName])
            ? item[fieldName]
            : []

          // user disconnects/removes some relationship items.
          const disconnectIds =
            resolvedData[
              targetFieldName
            ]?.disconnect?.map((obj: { id: number }) => obj.id.toString()) || []

          // filtered out to-be-disconnected relationship items
          currentOrder = previousOrder.filter(({ id }: { id: string }) => {
            return disconnectIds.indexOf(id) === -1
          })
        }

        // user connects/adds some relationship item.
        const connectedIds =
          resolvedData[targetFieldName]?.connect?.map((obj: { id: number }) =>
            obj.id.toString()
          ) || []

        if (connectedIds.length > 0) {
          // Query relationship items from the database.
          // Therefore, we can have other fields to record in the monitoring field
          const sfToConnect = await context.db[targetListName].findMany({
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
                [targetListLabelField]: sf[targetListLabelField],
              })
            }
          }
        }

        // records the order in the monitoring field
        resolvedData[fieldName] = currentOrder
      }
    }
    return resolvedData
  }
  return list
}

/**
 *  This functiona adds the virtual field onto Keystone6 `list` object.
 *  For instance, if we want to use monitoring field `manualOrderOfAuthors`
 *  to monitor relationship field `authors` in the `post` list object.
 *
 *  We could write
 *  ```
 *    addVirtualFieldToReturnItemsInInputOrder(post, {
 *      fieldName: 'manualOrderOfAuthors', // monitoring field
 *      targetFieldName: 'authors', // monitored field
 *      targetListName: 'Author' // relationship list
 *    })
 *  ```
 *  after executing,
 *  `post` list will have `authorsInInputOrder` virtual field.
 *
 *  Return value of this virtual field will follow
 *  `graphql.list(lists.Author.types.output)` GraphQL schema.
 *
 *  And the GQL resolver will be defined in `resolve` function.
 */
function addVirtualFieldToReturnItemsInInputOrder(
  list: ListConfig<any, any>,
  manualOrderField: ManualOrderFieldConfig
) {
  const virtualFieldName = `${manualOrderField.targetFieldName}InInputOrder`
  list.fields[virtualFieldName] = virtual({
    field: (lists) => {
      return graphql.field({
        type: graphql.list(
          lists?.[manualOrderField.targetListName]?.types.output
        ),
        async resolve(item: Record<string, unknown>, args, context) {
          const manualOrderFieldValue = item?.[manualOrderField.fieldName] || []
          if (!Array.isArray(manualOrderFieldValue)) {
            return []
          }

          // collect ids from relationship items
          const ids = manualOrderFieldValue.map((value) => value.id)

          // query items from database
          const unorderedItems = await context.db?.[
            manualOrderField.targetListName
          ].findMany({
            where: { id: { in: ids } },
          })

          const orderedItems: BaseItem[] = []

          // sort items according to input order
          manualOrderFieldValue.forEach((value) => {
            const writer = unorderedItems.find(
              (ui) => `${ui?.id}` === `${value?.id}`
            )
            if (writer) {
              orderedItems.push(writer)
            }
          })

          return orderedItems
        },
      })
    },
    ui: {
      // keystone somehow needs `ui.query` even we "hidden" the field in the next two lines.
      query: `{ id, ${manualOrderField.targetFieldName} }`,
      itemView: { fieldMode: 'hidden' },
      createView: { fieldMode: 'hidden' },
    },
  })
}

export default addManualOrderRelationshipFields
