/** @jsxRuntime classic */
/** @jsx jsx */

/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
import { jsx, Box } from '@keystone-ui/core'
import { Drawer } from '@keystone-ui/modals'
import { LoadingDots } from '@keystone-ui/loading'

import { useKeystone, useList } from '@keystone-6/core/admin-ui/context'

import { Fields } from '@keystone-6/core/admin-ui/utils'
import { useCreateItem } from '../../../../admin/utils/use-create-item'
import { GraphQLErrorNotice } from '@keystone-6/core/admin-ui/components'
import { useRef } from 'react'

export function CreateItemDrawer({
  listKey,
  defaultRole,
  onClose,
  onCreate,
}: {
  listKey: string
  defaultRole: string
  onClose: () => void
  onCreate: (item: { id: string; label: string }) => void
}) {
  const isAssignedRef = useRef(false)
  const { createViewFieldModes } = useKeystone()
  const list = useList(listKey)
  const createItemState = useCreateItem(list, { role: 'hidden' })

  if (isAssignedRef.current === false) {
    createItemState.props.onChange(() => {
      return Object.assign({}, createItemState.props.value, {
        ...createItemState.props.value,
        role: {
          kind: 'value',
          value: {
            kind: 'create',
            value: {
              value: defaultRole,
            },
          },
        },
      })
    })
    isAssignedRef.current = true
  }

  return (
    <Drawer
      title={`Create ${list.singular}`}
      width="wide"
      actions={{
        confirm: {
          label: `Create ${list.singular}`,
          loading: createItemState.state === 'loading',
          action: async () => {
            const item = await createItemState.create()
            if (item) {
              onCreate({ id: item.id, label: item.label || item.id })
            }
          },
        },
        cancel: {
          label: 'Cancel',
          action: () => {
            if (
              !createItemState.shouldPreventNavigation ||
              window.confirm(
                'There are unsaved changes, are you sure you want to exit?'
              )
            ) {
              onClose()
            }
          },
        },
      }}
    >
      {createViewFieldModes.state === 'error' && (
        <GraphQLErrorNotice
          networkError={
            createViewFieldModes.error instanceof Error
              ? createViewFieldModes.error
              : undefined
          }
          errors={
            createViewFieldModes.error instanceof Error
              ? undefined
              : createViewFieldModes.error
          }
        />
      )}
      {createViewFieldModes.state === 'loading' && (
        <LoadingDots label="Loading create form" />
      )}
      {createItemState.error && (
        <GraphQLErrorNotice
          networkError={createItemState.error?.networkError}
          errors={createItemState.error?.graphQLErrors}
        />
      )}
      <Box paddingY="xlarge">
        <Fields {...createItemState.props} />
      </Box>
    </Drawer>
  )
}
