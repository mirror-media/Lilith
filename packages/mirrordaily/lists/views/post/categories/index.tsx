/** @jsxRuntime classic */
/** @jsx jsx */

import { Fragment, useState, useEffect } from 'react'

import { Button } from '@keystone-ui/button'
// eslint-disable-next-line
import { jsx, Stack, useTheme } from '@keystone-ui/core';
import {
  FieldContainer,
  FieldDescription,
  FieldLabel,
  FieldLegend,
} from '@keystone-ui/fields'
import { DrawerController } from '@keystone-ui/modals'
import {
  CardValueComponent,
  CellComponent,
  FieldController,
  FieldControllerConfig,
  FieldProps,
  ListMeta,
} from '@keystone-6/core/types'
import { Link } from '@keystone-6/core/admin-ui/router'
import { useKeystone, useList } from '@keystone-6/core/admin-ui/context'
import {
  CellContainer,
  CreateItemDrawer,
} from '@keystone-6/core/admin-ui/components'

import { RelationshipSelect } from './RelationshipSelect'

function LinkToRelatedItems({
  itemId,
  value,
  list,
  refFieldKey,
}: {
  itemId: string | null
  value: FieldProps<typeof controller>['value'] & { kind: 'many' | 'one' }
  list: ListMeta
  refFieldKey?: string
}) {
  function constructQuery({
    refFieldKey,
    itemId,
    value,
  }: {
    refFieldKey?: string
    itemId: string | null
    value: FieldProps<typeof controller>['value'] & { kind: 'many' | 'one' }
  }) {
    if (!!refFieldKey && itemId) {
      return `!${refFieldKey}_matches="${itemId}"`
    }
    return `!id_in="${(value?.value as { id: string; label: string }[])
      .slice(0, 100)
      .map(({ id }: { id: string }) => id)
      .join(',')}"`
  }
  const commonProps = {
    size: 'small',
    tone: 'active',
    weight: 'link',
  } as const

  if (value.kind === 'many') {
    const query = constructQuery({ refFieldKey, value, itemId })
    return (
      <Button {...commonProps} as={Link as any} href={`/${list.path}?${query}`}>
        View related {list.plural}
      </Button>
    )
  }

  return (
    <Button
      {...commonProps}
      as={Link as any}
      href={`/${list.path}/${value.value?.id}`}
    >
      View {list.singular} details
    </Button>
  )
}

export const Field = ({
  field,
  autoFocus,
  value,
  onChange,
  forceValidation,
}: FieldProps<typeof controller>) => {
  const keystone = useKeystone()
  const foreignList = useList(field.refListKey)
  const localList = useList(field.listKey)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  if (value.kind === 'count') {
    return (
      <Stack as="fieldset" gap="medium">
        <FieldLegend>{field.label}</FieldLegend>
        <FieldDescription id={`${field.path}-description`}>
          {field.description}
        </FieldDescription>
        <div>
          {value.count === 1
            ? `There is 1 ${foreignList.singular} `
            : `There are ${value.count} ${foreignList.plural} `}
          linked to this {localList.singular}
        </div>
      </Stack>
    )
  }

  const authenticatedItem = keystone.authenticatedItem

  return (
    <FieldContainer as="fieldset">
      <FieldLabel as="legend">{field.label}</FieldLabel>
      <FieldDescription id={`${field.path}-description`}>
        {field.description}
      </FieldDescription>
      <Fragment>
        <Stack gap="medium">
          <RelationshipSelect
            controlShouldRenderValue
            aria-describedby={
              field.description === null
                ? undefined
                : `${field.path}-description`
            }
            autoFocus={autoFocus}
            isDisabled={onChange === undefined}
            labelField={field.refLabelField}
            searchFields={field.refSearchFields}
            list={foreignList}
            portalMenu
            state={
              value.kind === 'many'
                ? {
                    kind: 'many',
                    value: value.value,
                    onChange(newItems) {
                      onChange?.({
                        ...value,
                        value: newItems,
                      })
                    },
                  }
                : {
                    kind: 'one',
                    value: value.value,
                    onChange(newVal) {
                      if (value.kind === 'one') {
                        onChange?.({
                          ...value,
                          value: newVal,
                        })
                      }
                    },
                  }
            }
            orderBy={[{ id: 'desc' }]}
            currentItemId={value.id}
          />
          <Stack across gap="small">
            {onChange !== undefined && !field.hideCreate && (
              <Button
                size="small"
                disabled={isDrawerOpen}
                onClick={() => {
                  setIsDrawerOpen(true)
                }}
              >
                Create related {foreignList.singular}
              </Button>
            )}
            {onChange !== undefined &&
              authenticatedItem.state === 'authenticated' &&
              authenticatedItem.listKey === field.refListKey &&
              (value.kind === 'many'
                ? value.value.find((x) => x.id === authenticatedItem.id) ===
                  undefined
                : value.value?.id !== authenticatedItem.id) && (
                <Button
                  size="small"
                  onClick={() => {
                    const val = {
                      label: authenticatedItem.label,
                      id: authenticatedItem.id,
                    }
                    if (value.kind === 'many') {
                      onChange({
                        ...value,
                        value: [...value.value, val],
                      })
                    } else {
                      onChange({
                        ...value,
                        value: val,
                      })
                    }
                  }}
                >
                  {value.kind === 'many' ? 'Add ' : 'Set as '}
                  {authenticatedItem.label}
                </Button>
              )}
            {!!(value.kind === 'many'
              ? value.value.length
              : value.kind === 'one' && value.value) && (
              <LinkToRelatedItems
                itemId={value.id}
                refFieldKey={field.refFieldKey}
                list={foreignList}
                value={value}
              />
            )}
          </Stack>
        </Stack>
        {onChange !== undefined && (
          <DrawerController isOpen={isDrawerOpen}>
            <CreateItemDrawer
              listKey={foreignList.key}
              onClose={() => {
                setIsDrawerOpen(false)
              }}
              onCreate={(val) => {
                setIsDrawerOpen(false)
                if (value.kind === 'many') {
                  onChange({
                    ...value,
                    value: [...value.value, val],
                  })
                } else if (value.kind === 'one') {
                  onChange({
                    ...value,
                    value: val,
                  })
                }
              }}
            />
          </DrawerController>
        )}
      </Fragment>
    </FieldContainer>
  )
}

// @ts-ignore
export const Cell: CellComponent<typeof controller> = ({ field, item }) => {
  const list = useList(field.refListKey)
  const { colors } = useTheme()

  if (field.display === 'count') {
    const count = item[`${field.path}Count`] ?? 0
    return (
      <CellContainer>
        {count} {count === 1 ? list.singular : list.plural}
      </CellContainer>
    )
  }

  const hasManualOrder = field.listKey === 'Post'
  const fieldPath = hasManualOrder ? `${field.path}InInputOrder` : field.path
  const data = item[fieldPath]
  const items = (Array.isArray(data) ? data : [data]).filter((item) => item)
  const displayItems = items.length < 5 ? items : items.slice(0, 3)
  const overflow = items.length < 5 ? 0 : items.length - 3
  const labelField = hasManualOrder ? 'label' : field.refLabelField
  const styles = {
    color: colors.foreground,
    textDecoration: 'none',

    ':hover': {
      textDecoration: 'underline',
    },
  } as const

  return (
    <CellContainer>
      {displayItems.map((item, index) => (
        <Fragment key={item.id}>
          {index ? ', ' : ''}
          {/* @ts-ignore */}
          <Link
            href={`/${list.path}/${item.id}`}
            css={styles}
          >
            {item[labelField] || item.id}
          </Link>
        </Fragment>
      ))}
      {overflow ? `, and ${overflow} more` : null}
    </CellContainer>
  )
}

// @ts-ignore
export const CardValue: CardValueComponent<typeof controller> = ({
  field,
  item,
}) => {
  const list = useList(field.refListKey)
  const data = item[field.path]
  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      {(Array.isArray(data) ? data : [data])
        .filter((item) => item)
        .map((item, index) => (
          <Fragment key={item.id}>
            {index ? ', ' : ''}
            {/* @ts-ignore */}
            <Link href={`/${list.path}/${item.id}`}>
              {item.label || item.id}
            </Link>
          </Fragment>
        ))}
    </FieldContainer>
  )
}

type Value = { label: string; id: string }

type SingleRelationshipValue = {
  kind: 'one'
  id: null | string
  initialValue: Value | null
  value: Value | null
}
type ManyRelationshipValue = {
  kind: 'many'
  id: null | string
  initialValue: Value[]
  value: Value[]
}
type CountRelationshipValue = {
  kind: 'count'
  id: null | string
  count: number
}

type RelationshipController = FieldController<
  | ManyRelationshipValue
  | SingleRelationshipValue
  | CountRelationshipValue,
  string
> & {
  display: 'count' | 'select'
  listKey: string
  refListKey: string
  refFieldKey?: string
  refLabelField: string
  refSearchFields: string[]
  hideCreate: boolean
  many: boolean
}

export const controller = (
  config: FieldControllerConfig<
    {
      refFieldKey?: string
      refListKey: string
      many: boolean
      hideCreate: boolean
      refLabelField: string
      refSearchFields: string[]
    } & (
      | {
          displayMode: 'select'
        }
      | {
          displayMode: 'count'
        }
    )
  >
): RelationshipController => {
  const refLabelField = config.fieldMeta.refLabelField
  const refSearchFields = config.fieldMeta.refSearchFields
  
  // 檢查是否有 manualOrder 支援（通過檢查 listKey 是否為 Post）
  // 如果有 manualOrder，使用 InInputOrder；否則使用原始欄位
  const hasManualOrder = config.listKey === 'Post'
  const fieldPath = hasManualOrder ? `${config.path}InInputOrder` : config.path

  return {
    refFieldKey: config.fieldMeta.refFieldKey,
    many: config.fieldMeta.many,
    listKey: config.listKey,
    path: config.path,
    label: config.label,
    description: config.description,
    display:
      config.fieldMeta.displayMode === 'count' ? 'count' : 'select',
    refLabelField,
    refSearchFields,
    refListKey: config.fieldMeta.refListKey,
    graphqlSelection:
      config.fieldMeta.displayMode === 'count'
        ? `${config.path}Count`
        : `${fieldPath} {
              id
              ${hasManualOrder ? `label: ${refLabelField}` : refLabelField}
            }`,
    hideCreate: config.fieldMeta.hideCreate,
    defaultValue: config.fieldMeta.many
      ? {
          id: null,
          kind: 'many',
          initialValue: [],
          value: [],
        }
      : { id: null, kind: 'one', value: null, initialValue: null },
    deserialize: (data) => {
      if (config.fieldMeta.displayMode === 'count') {
        return {
          id: data.id,
          kind: 'count',
          count: data[`${config.path}Count`] ?? 0,
        }
      }
      if (config.fieldMeta.many) {
        // 根據是否有 manualOrder 決定使用哪個欄位
        const sourceData = hasManualOrder 
          ? (data[`${config.path}InInputOrder`] || [])
          : (data[config.path] || [])
        const value = (Array.isArray(sourceData) ? sourceData : []).map((x: any) => ({
          id: x.id,
          label: hasManualOrder ? (x.label || x.id) : (x[refLabelField] || x.id),
        }))
        return {
          kind: 'many',
          id: data.id,
          initialValue: value,
          value,
        }
      }
      // 根據是否有 manualOrder 決定使用哪個欄位
      const sourceValue = hasManualOrder
        ? data[`${config.path}InInputOrder`]
        : data[config.path]
      let value = null
      if (sourceValue) {
        value = {
          id: sourceValue.id,
          label: hasManualOrder 
            ? (sourceValue.label || sourceValue.id)
            : (sourceValue[refLabelField] || sourceValue.id),
        }
      }
      return {
        kind: 'one',
        id: data.id,
        value,
        initialValue: value,
      }
    },
    filter: {
      Filter: () => null,
      graphql: () => ({}),
      Label: () => '',
      types: {},
    },
    validate(value) {
      return true
    },
    serialize: (state) => {
      if (state.kind === 'many') {
        const newAllIds = new Set(state.value.map((x) => x.id))
        const initialIds = new Set(state.initialValue.map((x) => x.id))
        const disconnect = state.initialValue
          .filter((x) => !newAllIds.has(x.id))
          .map((x) => ({ id: x.id }))
        const connect = state.value
          .filter((x) => !initialIds.has(x.id))
          .map((x) => ({ id: x.id }))
        if (disconnect.length || connect.length) {
          const output: any = {}

          if (disconnect.length) {
            output.disconnect = disconnect
          }

          if (connect.length) {
            output.connect = connect
          }

          return {
            [config.path]: output,
          }
        }
      } else if (state.kind === 'one') {
        if (state.initialValue && !state.value) {
          return { [config.path]: { disconnect: true } }
        } else if (state.value && state.value.id !== state.initialValue?.id) {
          return {
            [config.path]: {
              connect: {
                id: state.value.id,
              },
            },
          }
        }
      }
      return {}
    },
  }
}

