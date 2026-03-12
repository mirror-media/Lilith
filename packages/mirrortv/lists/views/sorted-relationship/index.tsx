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

export const Field = ({ field, autoFocus, value, onChange, forceValidation }: FieldProps<any>) => {
  const foreignList = useList(field.refListKey)
  const localList = useList(field.listKey)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

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
          localList={localList}
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
          labelField="name"
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
                  value: value.value,
                  onChange(newVal: any) {
                    onChange?.({ ...value, value: newVal })
                  },
                }
          }
          orderBy={[{ id: 'desc' }]}
        />
      </Stack>
      {onChange !== undefined && !field.hideCreate && (
        <Button size="small" onClick={() => setIsDrawerOpen(true)} style={{ marginTop: 8 }}>
          Create {foreignList.singular}
        </Button>
      )}
      <DrawerController isOpen={isDrawerOpen}>
        <CreateItemDrawer
          listKey={foreignList.key}
          onClose={() => setIsDrawerOpen(false)}
          onCreate={(val) => {
            setIsDrawerOpen(false)
            const newVal = { id: val.id, label: val.name || val.id };
            if (value.kind === 'many') {
              onChange?.({ ...value, value: [...value.value, newVal] })
            } else {
              onChange?.({ ...value, value: newVal })
            }
          }}
        />
      </DrawerController>
    </FieldContainer>
  )
}

export const Cell: CellComponent<any> = ({ field, item }) => {
  const list = useList(field.refListKey)
  const data = item[field.path]
  const items = (Array.isArray(data) ? data : [data]).filter(Boolean)
  return (
    <CellContainer>
      {items.map((it: any, i: number) => (
        <Fragment key={it.id}>
          {i > 0 && ', '}
          <Link href={`/${list.path}/${it.id}`}>{it.name || it.label || it.id}</Link>
        </Fragment>
      ))}
    </CellContainer>
  )
}

export const controller = (config: FieldControllerConfig<any>): any => {
  const { many, displayMode, refLabelField } = config.fieldMeta;
  
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
    many,
    
    graphqlSelection: `${config.path} { id label: ${refLabelField || 'name'} } ${orderFieldKey ? orderFieldKey : ''}`,
    
    defaultValue: displayMode === 'cards'
      ? { kind: 'cards-view', id: null, initialIds: new Set(), currentIds: new Set(), itemsBeingEdited: new Set(), itemBeingCreated: false, displayOptions: config.fieldMeta }
      : many 
        ? { kind: 'many', id: null, initialValue: [], value: [] }
        : { kind: 'one', id: null, initialValue: null, value: null },

    deserialize: (data: any) => {
      const rawData = data[config.path];
      
      if (displayMode === 'cards') {
        const initialIdsArr = (Array.isArray(rawData) ? rawData : rawData ? [rawData] : []).map((x: any) => x.id);
        return {
          kind: 'cards-view',
          id: data.id,
          initialIds: new Set(initialIdsArr),
          currentIds: new Set(initialIdsArr),
          itemsBeingEdited: new Set(),
          itemBeingCreated: false,
          displayOptions: config.fieldMeta,
        };
      }

      if (many) {
        const orderData = orderFieldKey ? data[orderFieldKey] : null;
        let items = (Array.isArray(rawData) ? rawData : []).map((x: any) => ({ 
          id: x.id, 
          label: x.label || x.id 
        }));

        if (Array.isArray(orderData)) {
          items.sort((a: any, b: any) => {
            const indexA = orderData.indexOf(a.id);
            const indexB = orderData.indexOf(b.id);
            return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
          });
        }
        return { kind: 'many', id: data.id, initialValue: items, value: items };
      }

      const item = rawData ? { id: rawData.id, label: rawData.label || rawData.id } : null;
      return { kind: 'one', id: data.id, initialValue: item, value: item };
    },

    serialize: (state: any) => {
      const isUpdate = !!state.id;

      if (state.kind === 'cards-view') {
        const initialIdsArr = Array.from(state.initialIds as Set<string>);
        const currentIdsArr = Array.from(state.currentIds as Set<string>);
        
        if (JSON.stringify(initialIdsArr) === JSON.stringify(currentIdsArr)) return {};

        const res: any = {};
        if (many && orderFieldKey) res[orderFieldKey] = currentIdsArr;

        const connect = currentIdsArr.filter(id => !state.initialIds.has(id)).map(id => ({ id }));
        const disconnect = initialIdsArr.filter(id => !state.currentIds.has(id)).map(id => ({ id }));

        if (isUpdate) {
          if (connect.length > 0 || disconnect.length > 0) {
            res[config.path] = {};
            if (connect.length > 0) res[config.path].connect = connect;
            if (disconnect.length > 0) res[config.path].disconnect = disconnect;
          }
        } else {
          if (currentIdsArr.length > 0) {
            res[config.path] = many 
              ? { connect: currentIdsArr.map(id => ({ id })) }
              : { connect: { id: currentIdsArr[0] } };
          }
        }
        return res;
      }

      if (state.kind === 'many') {
        const newIds = state.value.map((x: any) => x.id);
        const oldIds = state.initialValue.map((x: any) => x.id);
        
        if (JSON.stringify(newIds) === JSON.stringify(oldIds)) return {};

        const res: any = {};
        if (orderFieldKey) res[orderFieldKey] = newIds;

        if (isUpdate) {
          const connect = newIds.filter(id => !oldIds.includes(id)).map(id => ({ id }));
          const disconnect = oldIds.filter(id => !newIds.includes(id)).map(id => ({ id }));
          
          if (connect.length > 0 || disconnect.length > 0) {
            res[config.path] = {};
            if (connect.length > 0) res[config.path].connect = connect;
            if (disconnect.length > 0) res[config.path].disconnect = disconnect;
          }
        } else {
          if (newIds.length > 0) {
            res[config.path] = { connect: newIds.map(id => ({ id })) };
          }
        }
        return res;
      }

      if (state.kind === 'one') {
        if (state.value?.id === state.initialValue?.id) return {};
        
        if (!state.value) {
          return isUpdate ? { [config.path]: { disconnect: true } } : {};
        }
        return { [config.path]: { connect: { id: state.value.id } } };
      }

      return {};
    },
  }
}
