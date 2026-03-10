/** @jsxRuntime classic */
/** @jsx jsx */

import { Fragment, useState } from 'react'
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
  value: any
  list: ListMeta
  refFieldKey?: string
}) {
  function constructQuery() {
    if (!!refFieldKey && itemId) {
      return `!${refFieldKey}_matches="${itemId}"`
    }
    const items = value.kind === 'many' ? value.value : [value.value].filter(Boolean)
    return `!id_in="${items.slice(0, 100).map((x: any) => x.id).join(',')}"`
  }
  const commonProps = { size: 'small', tone: 'active', weight: 'link' } as const

  if (value.kind === 'many') {
    return (
      <Button {...commonProps} as={Link as any} href={`/${list.path}?${constructQuery()}`}>
        View related {list.plural}
      </Button>
    )
  }
  return (
    <Button {...commonProps} as={Link as any} href={`/${list.path}/${value.value?.id}`}>
      檢視 {list.singular} 詳情
    </Button>
  )
}

export const Field = ({
  field,
  autoFocus,
  value,
  onChange,
}: FieldProps<typeof controller>) => {
  const keystone = useKeystone()
  const foreignList = useList(field.refListKey)
  const localList = useList(field.listKey)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  if (value.kind === 'count') {
    return (
      <Stack as="fieldset" gap="medium">
        <FieldLegend>{field.label}</FieldLegend>
        <FieldDescription id={`${field.path}-description`}>{field.description}</FieldDescription>
        <div>共計 {value.count} 個 {foreignList.plural} 連結至此 {localList.singular}</div>
      </Stack>
    )
  }

  return (
    <FieldContainer as="fieldset">
      <FieldLabel as="legend">{field.label}</FieldLabel>
      <FieldDescription id={`${field.path}-description`}>{field.description}</FieldDescription>
      <Stack gap="medium">
        <RelationshipSelect
          controlShouldRenderValue
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
                    onChange?.({ ...value, value: newItems })
                  },
                }
              : {
                  kind: 'one',
                  value: (value as any).value,
                  onChange(newVal: any) {
                    if (value.kind === 'one') onChange?.({ ...value, value: newVal })
                  },
                }
          }
          orderBy={[{ id: 'desc' }]}
          currentItemId={value.id}
        />
        <Stack across gap="small">
          {onChange !== undefined && !field.hideCreate && (
            <Button size="small" disabled={isDrawerOpen} onClick={() => setIsDrawerOpen(true)}>
              Create {foreignList.singular}
            </Button>
          )}
          {!!(value.kind === 'many' ? value.value.length : (value as any).value) && (
            <LinkToRelatedItems itemId={value.id} refFieldKey={field.refFieldKey} list={foreignList} value={value} />
          )}
        </Stack>
      </Stack>
      {onChange !== undefined && (
        <DrawerController isOpen={isDrawerOpen}>
          <CreateItemDrawer
            listKey={foreignList.key}
            onClose={() => setIsDrawerOpen(false)}
            onCreate={(val) => {
              setIsDrawerOpen(false)
              window.dispatchEvent(new CustomEvent('REFRESH_RELATIONSHIPS'));
              
              if (value.kind === 'many') {
                onChange({ ...value, value: [...value.value, val] })
              } else if (value.kind === 'one') {
                onChange({ ...value, value: val } as any)
              }
            }}
          />
        </DrawerController>
      )}
    </FieldContainer>
  )
}

export const Cell: CellComponent<typeof controller> = ({ field, item }) => {
  const list = useList(field.refListKey)
  const { colors } = useTheme()

  if (field.display === 'count') {
    const count = item[`${field.path}Count`] ?? 0
    return <CellContainer>{count} {count === 1 ? list.singular : list.plural}</CellContainer>
  }

  const data = item[field.path]
  const items = (Array.isArray(data) ? data : [data]).filter(Boolean)
  const displayItems = items.length < 5 ? items : items.slice(0, 3)
  
  return (
    <CellContainer>
      {displayItems.map((it, index) => (
        <Fragment key={it.id}>
          {index ? ', ' : ''}
          <Link href={`/${list.path}/${it.id}`} css={{ color: colors.foreground, textDecoration: 'none', ':hover': { textDecoration: 'underline' } }}>
            {it.label || it.id}
          </Link>
        </Fragment>
      ))}
      {items.length > 5 && `, 以及另外 ${items.length - 3} 個`}
    </CellContainer>
  )
}

export const CardValue: CardValueComponent<typeof controller> = ({ field, item }) => {
  const list = useList(field.refListKey)
  const data = item[field.path]
  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      {(Array.isArray(data) ? data : [data]).filter(Boolean).map((it, index) => (
        <Fragment key={it.id}>
          {index ? ', ' : ''}
          <Link href={`/${list.path}/${it.id}`}>{it.label || it.id}</Link>
        </Fragment>
      ))}
    </FieldContainer>
  )
}

export const controller = (config: FieldControllerConfig<any>): any => {
  const { refLabelField, refSearchFields } = config.fieldMeta
  
  const ORDER_FIELD_MAP: Record<string, string> = {
    categories: 'manualOrderOfCategories',
    writers: 'manualOrderOfWriters',
    photographers: 'manualOrderOfWriters', 
  }
  const SHARED_ORDER_FIELD = ORDER_FIELD_MAP[config.path]

  return {
    path: config.path,
    label: config.label,
    description: config.description,
    display: config.fieldMeta.displayMode === 'count' ? 'count' : 'select',
    refLabelField,
    refSearchFields,
    refListKey: config.fieldMeta.refListKey,
    listKey: config.listKey,
    many: config.fieldMeta.many,
    hideCreate: config.fieldMeta.hideCreate,
    
    graphqlSelection: config.fieldMeta.displayMode === 'count' 
      ? `${config.path}Count` 
      : `${config.path} { id label: ${refLabelField} } ${SHARED_ORDER_FIELD || ''}`,

    defaultValue: config.fieldMeta.many
      ? { kind: 'many', id: null, initialValue: [], value: [] }
      : { kind: 'one', id: null, initialValue: null, value: null },

    deserialize: (data: any) => {
      if (config.fieldMeta.displayMode === 'count') {
        return { id: data.id, kind: 'count', count: data[`${config.path}Count`] ?? 0 }
      }

      const pathData = data[config.path] || []
      const rawAllOrders = SHARED_ORDER_FIELD ? (data[SHARED_ORDER_FIELD] || {}) : {}
      const myOrderData = Array.isArray(rawAllOrders[config.path]) ? rawAllOrders[config.path] : []
      
      let value = (Array.isArray(pathData) ? pathData : [pathData]).filter(Boolean).map((x: any) => ({
        id: x.id,
        label: x.label || x[refLabelField] || x.id,
      }))

      if (config.fieldMeta.many && myOrderData.length > 0) {
        const orderMap = new Map(myOrderData.map((it: any, i: number) => [String(it.id), i]))
        value.sort((a, b) => (orderMap.get(String(a.id)) ?? 999) - (orderMap.get(String(b.id)) ?? 999))
      }

      return { 
        kind: config.fieldMeta.many ? 'many' : 'one', 
        id: data.id, 
        initialValue: value, 
        value: config.fieldMeta.many ? value : value[0] || null 
      }
    },

    serialize: (state: any) => {
      if (state.kind === 'many') {
        const isSameValue = state.value.length === state.initialValue.length &&
          state.value.every((v: any, i: number) => v.id === state.initialValue[i]?.id)

        const result: any = {}

        if (SHARED_ORDER_FIELD) {
          result[SHARED_ORDER_FIELD] = {
            __isOrderUpdate: true,
            path: config.path,
            data: state.value.map((x: any) => ({ id: String(x.id), name: String(x.label || x.id) }))
          }
        }

        if (!isSameValue) {
          result[config.path] = {
            disconnect: state.initialValue
              .filter((iv: { id: string }) => !state.value.some((v: { id: string }) => v.id === iv.id))
              .map((x: { id: string }) => ({ id: x.id })),
            connect: state.value
              .filter((v: { id: string }) => !state.initialValue.some((iv: { id: string }) => iv.id === v.id))
              .map((x: { id: string }) => ({ id: x.id })),
          }
        }
        return result
      }
      
      if (state.value?.id !== state.initialValue?.id) {
        if (!state.value) return { [config.path]: { disconnect: true } }
        return { [config.path]: { connect: { id: state.value.id } } }
      }
      return {}
    },
  }
}
