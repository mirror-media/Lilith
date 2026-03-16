/** @jsxRuntime classic */
/** @jsx jsx */
import { Fragment, useState } from 'react'
import { Button } from '@keystone-ui/button'
import { jsx, Stack } from '@keystone-ui/core'
import { FieldContainer, FieldDescription, FieldLabel, FieldLegend } from '@keystone-ui/fields'
import { DrawerController } from '@keystone-ui/modals'
import { CellComponent, FieldControllerConfig, FieldProps } from '@keystone-6/core/types'
import { Link } from '@keystone-6/core/admin-ui/router'
import { useList } from '@keystone-6/core/admin-ui/context'
import { CellContainer, CreateItemDrawer } from '@keystone-6/core/admin-ui/components'

import { Cards } from './cards'
import { RelationshipSelect } from './RelationshipSelect'

function LinkToRelatedItems({ itemId, value, list, refFieldKey }: any) {
  function constructQuery() {
    if (!!refFieldKey && itemId) return `!${refFieldKey}_matches="${itemId}"`
    const items = value.kind === 'many' ? value.value : value.value ? [value.value] : []
    const ids = items.map((x: any) => x.id).filter(Boolean).join(',')
    return `!id_in="${ids}"`
  }

  const commonProps = { size: 'small', tone: 'active', weight: 'link' } as const
  
  if (value.kind === 'many') {
    return (
      <Button {...commonProps} as={Link as any} href={`/${list.path}?${constructQuery()}`}>
        View related {list.plural}
      </Button>
    )
  }
  
  if (value.value?.id) {
    return (
      <Button {...commonProps} as={Link as any} href={`/${list.path}/${value.value.id}`}>
        View details
      </Button>
    )
  }
  return null
}

export const Field = ({ field, autoFocus, value, onChange, forceValidation }: FieldProps<any>) => {
  const foreignList = useList(field.refListKey)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  if (!foreignList) return null;

  const hasValue = value.kind === 'many' ? (value.value?.length > 0) : !!value.value?.id;
  const showViewRelated = hasValue || (!!field.refFieldKey && !!value.id);

  if (value.kind === 'cards-view') {
    return (
      <FieldContainer as="fieldset">
        <FieldLegend>{field.label}</FieldLegend>
        <FieldDescription id={`${field.path}-description`}>{field.description}</FieldDescription>
        <Cards
          forceValidation={forceValidation}
          field={field}
          id={value.id}
          value={value}
          onChange={onChange}
          foreignList={foreignList}
          localList={useList(field.listKey)}
        />
      </FieldContainer>
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
          labelField={field.refLabelField || 'name'}
          searchFields={field.refSearchFields}
          list={foreignList}
          portalMenu
          state={
            value.kind === 'many'
              ? {
                  kind: 'many',
                  value: value.value || [],
                  onChange(newItems: any) {
                    onChange?.({ ...value, value: newItems })
                  },
                }
              : {
                  kind: 'one',
                  value: value.value || null,
                  onChange(newVal: any) {
                    onChange?.({ ...value, value: newVal })
                  },
                }
          }
          orderBy={[{ id: 'desc' }]}
        />
        
        <Stack across gap="small" align="center">
          {onChange !== undefined && !field.hideCreate && (
            <Button size="small" onClick={() => setIsDrawerOpen(true)} look="ghost">
              Create {foreignList.singular}
            </Button>
          )}
          {showViewRelated && (
            <LinkToRelatedItems 
              itemId={value.id} 
              value={value} 
              list={foreignList} 
              refFieldKey={field.refFieldKey} 
            />
          )}
        </Stack>
      </Stack>

      <DrawerController isOpen={isDrawerOpen}>
        <CreateItemDrawer
          listKey={foreignList.key}
          onClose={() => setIsDrawerOpen(false)}
          onCreate={(val) => {
            setIsDrawerOpen(false)
            const newVal = { id: val.id, label: val.label || val.name || val.id };
            if (value.kind === 'many') {
              onChange?.({ ...value, value: [...(value.value || []), newVal] })
            } else {
              onChange?.({ ...value, value: newVal })
            }
          }}
        />
      </DrawerController>
    </FieldContainer>
  )
}

// --- Cell 組件 ---
export const Cell: CellComponent<any> = ({ field, item }) => {
  const list = useList(field.refListKey)
  const data = item[field.path]
  const items = (Array.isArray(data) ? data : [data]).filter(Boolean)
  return (
    <CellContainer>
      {items.map((it: any, i: number) => (
        <Fragment key={it.id}>
          {i > 0 && ', '}
          <Link href={`/${list.path}/${it.id}`}>{it.label || it.name || it.id}</Link>
        </Fragment>
      ))}
    </CellContainer>
  )
}

// --- Controller ---
export const controller = (config: FieldControllerConfig<any>): any => {
  const { many, displayMode, refLabelField, refFieldKey } = config.fieldMeta;
  const fieldPath = config.path;
  const suffix = fieldPath.endsWith('s') ? '' : 's';
  const orderFieldKey = many 
    ? `manualOrderOf${fieldPath.charAt(0).toUpperCase() + fieldPath.slice(1)}${suffix}` 
    : null;

  return {
    path: config.path,
    label: config.label,
    description: config.description,
    listKey: config.listKey, 
    refLabelField: refLabelField || 'name',
    refSearchFields: config.fieldMeta.refSearchFields,
    refListKey: config.fieldMeta.refListKey,
    refFieldKey,
    many,
    
    graphqlSelection: `${config.path} { id label: ${refLabelField || 'name'} } ${orderFieldKey ? orderFieldKey : ''}`,
    
    defaultValue: displayMode === 'cards'
      ? { 
          kind: 'cards-view', 
          id: null, 
          initialIds: new Set<string>(), 
          currentIds: new Set<string>(), 
          itemsBeingEdited: new Set(), 
          itemBeingCreated: false, 
          displayOptions: config.fieldMeta 
        }
      : many 
        ? { kind: 'many', id: null, initialValue: [], value: [] }
        : { kind: 'one', id: null, initialValue: null, value: null },

    deserialize: (data: any) => {
      const rawData = data[config.path];
      const orderData = orderFieldKey && data[orderFieldKey] ? data[orderFieldKey] : [];

      const items = (Array.isArray(rawData) ? rawData : rawData ? [rawData] : []).map((x: any) => ({
        id: String(x.id),
        label: x.label || x.id
      }));

      if (many && orderFieldKey && Array.isArray(orderData)) {
        items.sort((a, b) => {
          const indexA = orderData.findIndex((it: any) => 
            (typeof it === 'object' && it !== null) ? String(it.id) === a.id : String(it) === a.id
          );
          const indexB = orderData.findIndex((it: any) => 
            (typeof it === 'object' && it !== null) ? String(it.id) === b.id : String(it) === b.id
          );
          const posA = indexA === -1 ? 999999 : indexA;
          const posB = indexB === -1 ? 999999 : indexB;
          return posA - posB;
        });
      }

      if (displayMode === 'cards') {
        const ids = items.map(x => x.id);
        return {
          kind: 'cards-view',
          id: data.id,
          initialIds: new Set(ids), 
          currentIds: new Set(ids), 
          itemsBeingEdited: new Set(), 
          itemBeingCreated: false, 
          displayOptions: config.fieldMeta,
        };
      }

      if (many) {
        return { kind: 'many', id: data.id, initialValue: items, value: items };
      }
      return { kind: 'one', id: data.id, initialValue: items[0] || null, value: items[0] || null };
    },

    serialize: (state: any) => {
      const isUpdate = !!state.id;

      // 多選 (Many)
      if (state.kind === 'many' || (state.kind === 'cards-view' && many)) {
        const currentItems = state.kind === 'cards-view' 
          ? Array.from(state.currentIds).map(id => ({ id: String(id) }))
          : (state.value || []);
        
        const initialIds = state.kind === 'cards-view'
          ? Array.from(state.initialIds).map(id => String(id))
          : (state.initialValue || []).map((x: any) => String(x.id));

        const currentIds = currentItems.map((x: any) => String(x.id));
        
        if (JSON.stringify(currentIds) === JSON.stringify(initialIds)) return {};

        const res: any = {};
        if (orderFieldKey && many) {
          res[orderFieldKey] = currentItems.map((x: any) => ({ id: x.id, name: x.label || x.id }));
        }

        if (isUpdate) {
          const connect = currentIds.filter(id => !initialIds.includes(id)).map(id => ({ id }));
          const disconnect = initialIds.filter(id => !currentIds.includes(id)).map(id => ({ id }));
          if (connect.length || disconnect.length) {
            res[config.path] = { 
              connect: connect.length ? connect : undefined, 
              disconnect: disconnect.length ? disconnect : undefined 
            };
          }
        } else {
          if (currentIds.length) {
            res[config.path] = { connect: currentIds.map(id => ({ id })) };
          }
        }
        return res;
      }

      // 單選 (One) - 修正 Img 
      if (state.kind === 'one' || (state.kind === 'cards-view' && !many)) {
        let currentId: string | null = null;
        let initialId: string | null = null;

        if (state.kind === 'cards-view') {
          const firstCurrent = Array.from(state.currentIds)[0];
          const firstInitial = Array.from(state.initialIds)[0];
          currentId = firstCurrent !== undefined ? String(firstCurrent) : null;
          initialId = firstInitial !== undefined ? String(firstInitial) : null;
        } else {
          currentId = state.value?.id ? String(state.value.id) : null;
          initialId = state.initialValue?.id ? String(state.initialValue.id) : null;
        }

        if (initialId === currentId) return {};

        if (isUpdate) {
          if (!currentId) return { [config.path]: { disconnect: true } };
          return { [config.path]: { connect: { id: currentId } } };
        } else {
          if (!currentId) return {};
          return { [config.path]: { connect: { id: currentId } } };
        }
      }

      return {};
    },
  }
}
