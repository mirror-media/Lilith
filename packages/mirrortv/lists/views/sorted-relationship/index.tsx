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
  const { many, displayMode } = config.fieldMeta;
  const pathWithUpper = config.path.charAt(0).toUpperCase() + config.path.slice(1);
  const orderFieldKey = many ? `manualOrderOf${pathWithUpper}` : null;

  return {
    path: config.path,
    label: config.label,
    description: config.description,
    listKey: config.listKey, 
    refLabelField: 'name',
    refSearchFields: config.fieldMeta.refSearchFields,
    refListKey: config.fieldMeta.refListKey,
    many,
    
    graphqlSelection: `${config.path} { id name } ${orderFieldKey ? orderFieldKey : ''}`,
    
    defaultValue: displayMode === 'cards'
      ? { kind: 'cards-view', id: null, initialIds: new Set(), currentIds: new Set(), itemsBeingEdited: new Set(), itemBeingCreated: false, displayOptions: config.fieldMeta }
      : many 
        ? { kind: 'many', initialValue: [], value: [] }
        : { kind: 'one', initialValue: null, value: null },

    deserialize: (data: any) => {
      const rawData = data[config.path];
      
      if (displayMode === 'cards') {
        const initialIds = new Set<string>((Array.isArray(rawData) ? rawData : rawData ? [rawData] : []).map((x: any) => x.id));
        return {
          kind: 'cards-view',
          id: data.id,
          initialIds,
          currentIds: initialIds,
          itemsBeingEdited: new Set(),
          itemBeingCreated: false,
          displayOptions: config.fieldMeta,
        };
      }

      if (many) {
        const orderData = orderFieldKey ? data[orderFieldKey] : null;
        let items = (Array.isArray(rawData) ? rawData : []).map((x: any) => ({ id: x.id, label: x.name || x.id }));
        if (Array.isArray(orderData)) {
          items.sort((a: any, b: any) => (orderData.indexOf(a.id) === -1 ? 999 : orderData.indexOf(a.id)) - (orderData.indexOf(b.id) === -1 ? 999 : orderData.indexOf(b.id)));
        }
        return { kind: 'many', initialValue: items, value: items };
      }

      const item = rawData ? { id: rawData.id, label: rawData.name || rawData.id } : null;
      return { kind: 'one', initialValue: item, value: item };
    },

    serialize: (state: any) => {
      if (state.kind === 'cards-view') {
        const initialIdsArr = Array.from(state.initialIds as Set<string>);
        const currentIdsArr = Array.from(state.currentIds as Set<string>);
        const disconnect = initialIdsArr.filter((id: string) => !state.currentIds.has(id)).map((id: string) => ({ id }));
        const connect = currentIdsArr.filter((id: string) => !state.initialIds.has(id)).map((id: string) => ({ id }));
        const orderChanged = JSON.stringify(initialIdsArr) !== JSON.stringify(currentIdsArr);

        if (connect.length === 0 && disconnect.length === 0 && !orderChanged) return {};

        const res: any = {};
        if (connect.length > 0 || disconnect.length > 0) {
          res[config.path] = many 
            ? { connect: connect.length ? connect : undefined, disconnect: disconnect.length ? disconnect : undefined }
            : connect.length ? { connect: connect[0] } : { disconnect: true };
        }
        if (many && orderFieldKey && orderChanged) res[orderFieldKey] = currentIdsArr;
        return res;
      }

      if (state.kind === 'many') {
        const newIds: string[] = state.value.map((x: any) => x.id)
        const oldIds: string[] = state.initialValue.map((x: any) => x.id)
        const orderChanged = JSON.stringify(newIds) !== JSON.stringify(oldIds);
        const disconnect = oldIds.filter((id: string) => !newIds.includes(id)).map((id: string) => ({ id }));
        const connect = newIds.filter((id: string) => !oldIds.includes(id)).map((id: string) => ({ id }));

        if (connect.length === 0 && disconnect.length === 0 && !orderChanged) return {};
        const res: any = {};
        if (connect.length > 0 || disconnect.length > 0) {
          res[config.path] = { disconnect: disconnect.length ? disconnect : undefined, connect: connect.length ? connect : undefined };
        }
        if (orderFieldKey && orderChanged) res[orderFieldKey] = newIds;
        return res;
      }

      if (state.kind === 'one') {
        if (state.value?.id === state.initialValue?.id) return {};
        return state.value ? { [config.path]: { connect: { id: state.value.id } } } : { [config.path]: { disconnect: true } };
      }
      return {};
    },
  }
}
