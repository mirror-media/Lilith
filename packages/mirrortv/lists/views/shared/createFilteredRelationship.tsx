/** @jsxRuntime classic */
/** @jsx jsx */

import { Fragment, useState, useEffect } from 'react'
import { jsx, Stack, useTheme } from '@keystone-ui/core'
import {
  FieldContainer,
  FieldDescription,
  FieldLabel,
  FieldLegend,
} from '@keystone-ui/fields'
import { Button } from '@keystone-ui/button'
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
import { fieldFilterManager } from './fieldFilterManager'
import { createFilteredRelationshipSelect } from './createFilteredRelationshipSelect'

type FilterConfig = {
  /**
   * 要監聽的源欄位名稱（例如：'sections'）
   */
  sourceField: string
  
  /**
   * 目標欄位的 GraphQL 關係名稱（例如：'sections'）
   * 用於在 where 查詢中過濾
   */
  filterByField: string
  
  /**
   * 當沒有選擇源欄位時顯示的提示訊息
   */
  emptyMessage?: string
}

/**
 * 創建一個具有過濾功能的關係欄位組件
 * @param config 過濾配置
 */
export function createFilteredRelationship(config: FilterConfig) {
  const RelationshipSelect = createFilteredRelationshipSelect(config)

  function LinkToRelatedItems({
    itemId,
    value,
    list,
    refFieldKey,
  }: {
    itemId: string | null
    value: FieldProps<any>['value'] & { kind: 'many' | 'one' }
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
      value: FieldProps<any>['value'] & { kind: 'many' | 'one' }
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

  const Field = ({
    field,
    autoFocus,
    value,
    onChange,
    forceValidation,
  }: FieldProps<any>) => {
    const keystone = useKeystone()
    const foreignList = useList(field.refListKey)
    const localList = useList(field.listKey)
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)

    // 從 value 中獲取源欄位的數據
    const sourceFieldIds = (value as any)[`${config.sourceField}Ids`] || []

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
                      onChange(newItems: any) {
                        onChange?.({
                          ...value,
                          value: newItems,
                        })
                      },
                    }
                  : {
                      kind: 'one',
                      value: value.value,
                      onChange(newVal: any) {
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
              sourceFieldIds={sourceFieldIds}
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
                  ? value.value.find((x: any) => x.id === authenticatedItem.id) ===
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
                onCreate={(val: any) => {
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
  const Cell: CellComponent<any> = ({ field, item }) => {
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

    const data = item[field.path]
    const items = (Array.isArray(data) ? data : [data]).filter((item) => item)
    const displayItems = items.length < 5 ? items : items.slice(0, 3)
    const overflow = items.length < 5 ? 0 : items.length - 3
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
            <Link href={`/${list.path}/${item.id}`} css={styles}>
              {item.label || item.id}
            </Link>
          </Fragment>
        ))}
        {overflow ? `, and ${overflow} more` : null}
      </CellContainer>
    )
  }

  // @ts-ignore
  const CardValue: CardValueComponent<any> = ({ field, item }) => {
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

  const controller = (
    config: FieldControllerConfig<{
      refFieldKey?: string
      refListKey: string
      many: boolean
      hideCreate: boolean
      refLabelField: string
      refSearchFields: string[]
    } & ({ displayMode: 'select' } | { displayMode: 'count' })>
  ): any => {
    const refLabelField = config.fieldMeta.refLabelField
    const refSearchFields = config.fieldMeta.refSearchFields

    return {
      refFieldKey: config.fieldMeta.refFieldKey,
      many: config.fieldMeta.many,
      listKey: config.listKey,
      path: config.path,
      label: config.label,
      description: config.description,
      display: config.fieldMeta.displayMode === 'count' ? 'count' : 'select',
      refLabelField,
      refSearchFields,
      refListKey: config.fieldMeta.refListKey,
      graphqlSelection:
        config.fieldMeta.displayMode === 'count'
          ? `${config.path}Count`
          : `${config.path}InInputOrder {
              id
              label: ${refLabelField}
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
      deserialize: (data: any) => {
        if (config.fieldMeta.displayMode === 'count') {
          return {
            id: data.id,
            kind: 'count',
            count: data[`${config.path}Count`] ?? 0,
          }
        }
        if (config.fieldMeta.many) {
          const value = (data[`${config.path}InInputOrder`] || []).map((x: any) => ({
            id: x.id,
            label: x.label || x.id,
          }))
          return {
            kind: 'many',
            id: data.id,
            initialValue: value,
            value,
          }
        }
        let value = data[`${config.path}InInputOrder`]
        if (value) {
          value = {
            id: value.id,
            label: value.label || value.id,
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
      validate(value: any) {
        return true
      },
      serialize: (state: any) => {
        if (state.kind === 'many') {
          const newAllIds = new Set(state.value.map((x: any) => x.id))
          const initialIds = new Set(state.initialValue.map((x: any) => x.id))
          const disconnect = state.initialValue
            .filter((x: any) => !newAllIds.has(x.id))
            .map((x: any) => ({ id: x.id }))
          const connect = state.value
            .filter((x: any) => !initialIds.has(x.id))
            .map((x: any) => ({ id: x.id }))
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

  return { Field, Cell, CardValue, controller }
}

