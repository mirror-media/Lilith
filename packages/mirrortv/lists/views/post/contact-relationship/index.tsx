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
} from '@keystone-ui/fields'
import { DrawerController } from '@keystone-ui/modals'
import {
  CardValueComponent,
  CellComponent,
  FieldControllerConfig,
  FieldProps,
} from '@keystone-6/core/types'
import { Link } from '@keystone-6/core/admin-ui/router'
import { useList } from '@keystone-6/core/admin-ui/context'
import { CellContainer } from '@keystone-6/core/admin-ui/components'
import { CreateItemDrawer } from './CreateItemDrawer'
import { RelationshipSelect } from './RelationshipSelect'

type RelationshipItem = {
  id: string;
  label: string;
};

function LinkToRelatedItems({ itemId, value, list, refFieldKey }: any) {
  function constructQuery() {
    if (!!refFieldKey && itemId) return `!${refFieldKey}_matches="${itemId}"`
    const items = value.kind === 'many' ? value.value : value.value ? [value.value] : []
    const ids = items.map((x: any) => x.id).join(',')
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
  return <Button {...commonProps} as={Link as any} href={`/${list.path}/${value.value?.id}`}>View details</Button>
}

export const Field = ({ field, autoFocus, value, onChange }: FieldProps<typeof controller>) => {
  const foreignList = useList(field.refListKey)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  if (!foreignList) return <div>Loading...</div>;

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
        />
        <Stack across gap="small">
          {onChange !== undefined && !field.hideCreate && (
            <Button size="small" onClick={() => setIsDrawerOpen(true)}>Create {foreignList.singular}</Button>
          )}
          {!!(value.kind === 'many' ? value.value.length : (value as any).value) && (
            <LinkToRelatedItems itemId={value.id} refFieldKey={field.refFieldKey} list={foreignList} value={value as any} />
          )}
        </Stack>
      </Stack>
      {onChange !== undefined && (
        <DrawerController isOpen={isDrawerOpen}>
          <CreateItemDrawer
            listKey={foreignList.key}
            onClose={() => setIsDrawerOpen(false)}
            onCreate={(val: any) => {
              setIsDrawerOpen(false)
              window.dispatchEvent(new CustomEvent('REFRESH_RELATIONSHIPS'));
              
              const newVal: RelationshipItem = { 
                id: String(val.id), 
                label: val.label || val.name || String(val.id) 
              };

              if (value.kind === 'many') {
                onChange({ ...value, value: [...value.value, newVal] })
              } else if (value.kind === 'one') {
                onChange({ ...value, value: newVal } as any)
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
  const data = item[field.path]
  const items = (Array.isArray(data) ? data : [data]).filter(Boolean)
  return (
    <CellContainer>
      {items.slice(0, 3).map((it, i) => (
        <Fragment key={it.id}>{i ? ', ' : ''}<Link href={`/${list.path}/${it.id}`}>{it.label || it.id}</Link></Fragment>
      ))}
      {items.length > 3 && ` +${items.length - 3}`}
    </CellContainer>
  )
}

export const CardValue: CardValueComponent<typeof controller> = ({ field, item }) => {
  const list = useList(field.refListKey)
  const data = item[field.path]
  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      {(Array.isArray(data) ? data : [data]).filter(Boolean).map((it, i) => (
        <Fragment key={it.id}>{i ? ', ' : ''}<Link href={`/${list.path}/${it.id}`}>{it.label || it.id}</Link></Fragment>
      ))}
    </FieldContainer>
  )
}

export const controller = (config: FieldControllerConfig<any>): any => {
  const { refLabelField, refSearchFields } = config.fieldMeta;
  
  const fieldPath = config.path;
  const suffix = fieldPath.endsWith('s') ? '' : 's';
  const ORDER_FIELD_NAME = `manualOrderOf${fieldPath.charAt(0).toUpperCase() + fieldPath.slice(1)}${suffix}`;

  return {
    path: config.path,
    label: config.label,
    description: config.description,
    display: config.fieldMeta.displayMode === 'count' ? 'count' : 'cards-or-select',
    refLabelField,
    refSearchFields,
    refListKey: config.fieldMeta.refListKey,
    listKey: config.listKey,
    many: config.fieldMeta.many,
    graphqlSelection: `${config.path} { id label: ${refLabelField} } ${ORDER_FIELD_NAME}`,

    defaultValue: config.fieldMeta.many
      ? { kind: 'many', id: null, initialValue: [], value: [] }
      : { kind: 'one', id: null, initialValue: null, value: null },

    deserialize: (data: any) => {
      const pathData = data[config.path] || [];
      const myOrderData = Array.isArray(data[ORDER_FIELD_NAME]) ? data[ORDER_FIELD_NAME] : [];
      
      const currentItemsMap = new Map(
        (Array.isArray(pathData) ? pathData : [pathData])
          .filter(Boolean)
          .map((x: any) => [String(x.id).trim(), x])
      );
      
      let sortedValue: RelationshipItem[] = [];

      myOrderData.forEach((orderedItem: any) => {
        const id = (orderedItem && typeof orderedItem === 'object') 
          ? String(orderedItem.id).trim() 
          : String(orderedItem).trim();

        const item = currentItemsMap.get(id);
        if (item) {
          sortedValue.push({ id: String(item.id), label: item.label || String(item.id) });
          currentItemsMap.delete(id); 
        }
      });

      currentItemsMap.forEach((item: any) => {
        sortedValue.push({ id: String(item.id), label: item.label || String(item.id) });
      });

      if (!config.fieldMeta.many) {
        return { kind: 'one', id: data.id, initialValue: sortedValue[0] || null, value: sortedValue[0] || null };
      }

      return { kind: 'many', id: data.id, initialValue: sortedValue, value: sortedValue };
    },

    serialize: (state: any) => {
      const isUpdate = !!state.id;

      if (state.kind === 'many') {
        const newItems: RelationshipItem[] = state.value || [];
        const oldItems: RelationshipItem[] = state.initialValue || [];
        
        const newIds = newItems.map((x) => String(x.id).trim());
        const oldIds = oldItems.map((x) => String(x.id).trim());

        const isOrderChanged = JSON.stringify(newIds) !== JSON.stringify(oldIds);
        if (!isOrderChanged) return {};

        const res: any = {
          [ORDER_FIELD_NAME]: newItems.map((x) => ({ 
            id: String(x.id), 
            name: String(x.label || x.id) 
          })),
        };

        const disconnect = oldIds
          .filter((id) => !newIds.includes(id))
          .map((id) => ({ id }));
        
        const connect = newIds
          .filter((id) => !oldIds.includes(id))
          .map((id) => ({ id }));

        if (isUpdate) {
          if (connect.length > 0 || disconnect.length > 0) {
            res[config.path] = {
              connect: connect.length > 0 ? connect : undefined,
              disconnect: disconnect.length > 0 ? disconnect : undefined,
            };
          }
        } else {
          if (newIds.length > 0) {
            res[config.path] = {
              connect: newIds.map((id) => ({ id })),
            };
          }
        }
        return res;
      }
      
      if (state.value?.id !== state.initialValue?.id) {
        if (!state.value) {
          return isUpdate ? { [config.path]: { disconnect: true } } : {};
        }
        return { [config.path]: { connect: { id: state.value.id } } };
      }
      return {};
    },
  };
};