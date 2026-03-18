/** @jsxRuntime classic */
/** @jsx jsx */
import { Fragment } from 'react'
import { jsx } from '@keystone-ui/core'
import { FieldContainer, FieldDescription, FieldLabel } from '@keystone-ui/fields'
import { FieldProps, FieldControllerConfig, CellComponent, CardValueComponent } from '@keystone-6/core/types'
import { useList } from '@keystone-6/core/admin-ui/context'
import { useRouter, Link } from '@keystone-6/core/admin-ui/router'
import { CellContainer } from '@keystone-6/core/admin-ui/components'

import { RelationshipSelect } from './RelationshipSelect'

type CustomController = typeof controller;

export const Field = ({ field, value, onChange, autoFocus }: FieldProps<CustomController>) => {
  const foreignList = useList(field.refListKey)
  const router = useRouter()
  const { id: routeId } = router.query

  const currentPostId = 
    field.listKey === field.refListKey && typeof routeId === 'string' 
      ? routeId 
      : '';

  return (
    <FieldContainer as="fieldset">
      <FieldLabel>{field.label}</FieldLabel>
      <FieldDescription>{field.description}</FieldDescription>
      <RelationshipSelect
        controlShouldRenderValue
        autoFocus={autoFocus}
        isDisabled={onChange === undefined}
        labelField="label" 
        searchFields={field.refSearchFields}
        list={foreignList!}
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
                  onChange?.({ ...value, value: newVal })
                },
              }
        }
        orderBy={[{ publishTime: 'desc' }]}
        currentPostId={currentPostId}
      />
    </FieldContainer>
  )
}

export const Cell: CellComponent<CustomController> = ({ field, item }) => {
  const list = useList(field.refListKey)
  const data = item[field.path]
  const items = (Array.isArray(data) ? data : [data]).filter(Boolean)
  return (
    <CellContainer>
      {items.map((it: any, i: number) => (
        <Fragment key={it.id}>
          {i ? ', ' : ''}
          <Link href={`/${list.path}/${it.id}`}>{it.label || it.id}</Link>
        </Fragment>
      ))}
    </CellContainer>
  )
}

export const CardValue: CardValueComponent<CustomController> = ({ field, item }) => {
  const list = useList(field.refListKey)
  const data = item[field.path]
  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      {(Array.isArray(data) ? data : [data]).filter(Boolean).map((it: any, i: number) => (
        <Fragment key={it.id}>
          {i ? ', ' : ''}
          <Link href={`/${list.path}/${it.id}`}>{it.label || it.id}</Link>
        </Fragment>
      ))}
    </FieldContainer>
  )
}

export const controller = (config: FieldControllerConfig<any>): any => {
  const { many, displayMode, refLabelField } = config.fieldMeta;
  const fieldPath = config.path;
  const suffix = fieldPath.endsWith('s') ? '' : 's';
  const orderFieldKey = `manualOrderOf${fieldPath.charAt(0).toUpperCase() + fieldPath.slice(1)}${suffix}`;

  return {
    path: config.path,
    label: config.label,
    description: config.description,
    listKey: config.listKey,
    refListKey: config.fieldMeta.refListKey,
    refLabelField: refLabelField || 'name', 
    refSearchFields: config.fieldMeta.refSearchFields || ['name', 'slug'],
    many,

    graphqlSelection: `${config.path} { id label: ${refLabelField || 'name'} } ${orderFieldKey}`,
    
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
        ? { kind: 'many', initialValue: [], value: [] }
        : { kind: 'one', initialValue: null, value: null },

    deserialize: (data: any) => {
      const rawData = data[config.path] || [];
      const orderData = Array.isArray(data[orderFieldKey]) ? data[orderFieldKey] : [];
      
      const items = (Array.isArray(rawData) ? rawData : [rawData]).filter(Boolean).map((x: any) => ({
        id: String(x.id),
        label: x.label || x.id
      }));

      if (many && orderData.length > 0) {
        const orderMap = new Map(
          orderData.map((it: any, index: number) => {
            const id = (it && typeof it === 'object' ? String(it.id) : String(it));
            return [id, index];
          })
        );
        items.sort((a, b) => {
          const posA = orderMap.get(a.id) ?? Infinity;
          const posB = orderMap.get(b.id) ?? Infinity;
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

      const item = items[0] || null;
      return { kind: 'one', id: data.id, initialValue: item, value: item };
    },

    serialize: (state: any) => {
      const isUpdate = !!state.id;

      const getRelationalChanges = (currentItems: any[], initialItems: any[]) => {
        const currentIds = currentItems.map(x => String(x.id));
        const initialIds = initialItems.map(x => String(x.id));
        
        const isOrderChanged = currentIds.length !== initialIds.length || 
                              currentIds.some((id, i) => id !== initialIds[i]);

        if (!isOrderChanged) return null;

        const changeResult: any = {
          [orderFieldKey]: currentItems.map(x => ({
            id: String(x.id),
            name: String(x.label || x.id)
          }))
        };

        if (isUpdate) {
            changeResult[config.path] = { set: currentIds.map(id => ({ id })) };
        } else {
          if (currentIds.length > 0) {
            changeResult[config.path] = { connect: currentIds.map(id => ({ id })) };
          }
        }
        return changeResult;
      };

      if (state.kind === 'cards-view') {
        const currentItems = Array.from(state.currentIds).map(id => ({ id: String(id) }));
        const initialItems = Array.from(state.initialIds).map(id => ({ id: String(id) }));
        const changes = getRelationalChanges(currentItems, initialItems);
        return changes || {};
      }

      if (state.kind === 'many') {
        const changes = getRelationalChanges(state.value, state.initialValue);
        return changes || {};
      }

      if (state.kind === 'one') {
        const currentId = state.value?.id ? String(state.value.id) : null;
        const initialId = state.initialValue?.id ? String(state.initialValue.id) : null;
        
        if (currentId === initialId) return {};
        if (!currentId) return isUpdate ? { [config.path]: { disconnect: true } } : {};
        return { [config.path]: { connect: { id: currentId } } };
      }

      return {};
    },
  };
}
