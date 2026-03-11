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
  
  const fieldPath = config.path;
  const suffix = fieldPath.endsWith('s') ? '' : 's';
  const orderFieldKey = `manualOrderOf${fieldPath.charAt(0).toUpperCase() + fieldPath.slice(1)}${suffix}`;

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
      : `${config.path} { id label: ${refLabelField} } ${orderFieldKey}`,

    defaultValue: config.fieldMeta.many
      ? { kind: 'many', id: null, initialValue: [], value: [] }
      : { kind: 'one', id: null, initialValue: null, value: null },

    deserialize: (data: any) => {
      if (config.fieldMeta.displayMode === 'count') {
        return { id: data.id, kind: 'count', count: data[`${config.path}Count`] ?? 0 }
      }

      const pathData = data[config.path] || []
      const orderData = data[orderFieldKey];
      
      let value = (Array.isArray(pathData) ? pathData : [pathData]).filter(Boolean).map((x: any) => ({
        id: x.id,
        label: x.label || x[refLabelField] || x.id,
      }))

      if (config.fieldMeta.many && Array.isArray(orderData)) {
        value.sort((a: any, b: any) => {
          const indexA = orderData.findIndex((it: any) => (typeof it === 'object' ? it.id === a.id : it === a.id));
          const indexB = orderData.findIndex((it: any) => (typeof it === 'object' ? it.id === b.id : it === b.id));
          return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
        });
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
        const newIds = state.value.map((x: any) => x.id);
        const oldIds = state.initialValue.map((x: any) => x.id);
        
        if (JSON.stringify(newIds) === JSON.stringify(oldIds)) return {};

        const disconnect = state.initialValue
          .filter((iv: { id: string }) => !newIds.includes(iv.id))
          .map((x: { id: string }) => ({ id: x.id }));

        const connect = state.value
          .filter((v: { id: string }) => !oldIds.includes(v.id))
          .map((x: { id: string }) => ({ id: x.id }));

        const result: any = {
          [orderFieldKey]: newIds
        };

        if (connect.length > 0 || disconnect.length > 0) {
          result[config.path] = {};
          if (connect.length > 0) result[config.path].connect = connect;
          if (disconnect.length > 0) result[config.path].disconnect = disconnect;
        }

        return result;
      }
      
      if (state.value?.id !== state.initialValue?.id) {
        if (!state.value) return { [config.path]: { disconnect: true } }
        return { [config.path]: { connect: { id: state.value.id } } }
      }
      return {}
    },
  }
}
