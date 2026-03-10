/** @jsxRuntime classic */
/** @jsx jsx */
import { Fragment } from 'react'
import { jsx, Stack } from '@keystone-ui/core'
import { FieldContainer, FieldDescription, FieldLabel } from '@keystone-ui/fields'
import { FieldProps, FieldControllerConfig, CellComponent } from '@keystone-6/core/types'
import { useList } from '@keystone-6/core/admin-ui/context'
import { useRouter, Link } from '@keystone-6/core/admin-ui/router'
import { CellContainer } from '@keystone-6/core/admin-ui/components'

import { RelationshipSelect } from './RelationshipSelect'

export const Field = ({ field, value, onChange, autoFocus }: FieldProps<typeof controller>) => {
  const foreignList = useList(field.refListKey)
  const router = useRouter()
  const { id: routeId } = router.query
  const currentPostId = typeof routeId === 'string' ? routeId : ''

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
        orderBy={[{ publishTime: 'desc' }]}
        currentPostId={currentPostId}
      />
    </FieldContainer>
  )
}

export const Cell: CellComponent<typeof controller> = ({ field, item }) => {
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

export const controller = (config: FieldControllerConfig<any>): any => {
  const orderFieldKey = 'manualOrderOfRelatedPosts'

  return {
    path: config.path,
    label: config.label,
    description: config.description,
    listKey: config.listKey,
    refListKey: config.fieldMeta.refListKey,
    
    refLabelField: config.fieldMeta.refLabelField || 'name', 
    refSearchFields: config.fieldMeta.refSearchFields || ['name', 'slug'],
    many: config.fieldMeta.many,

    graphqlSelection: `${config.path} { id label } ${orderFieldKey}`,
    
    defaultValue: { kind: 'many', initialValue: [], value: [] },

    deserialize: (data: any) => {
      const rawItems = (Array.isArray(data[config.path]) ? data[config.path] : [])
        .map((x: any) => ({ 
          id: x.id, 
          label: x.label || x.id 
        }));
      
      const orderData = data[orderFieldKey];
      if (Array.isArray(orderData)) {
        rawItems.sort((a: any, b: any) => {
          const indexA = orderData.indexOf(a.id);
          const indexB = orderData.indexOf(b.id);
          return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
        });
      }

      return {
        kind: 'many',
        initialValue: rawItems,
        value: rawItems,
      };
    },

    serialize: (state: any) => {
      if (state.kind === 'many') {
        const newIds = state.value.map((x: any) => x.id);
        const oldIds = state.initialValue.map((x: any) => x.id);
        if (JSON.stringify(newIds) === JSON.stringify(oldIds)) return {};
        return {
          [config.path]: {
            disconnect: state.initialValue.filter((x: any) => !newIds.includes(x.id)).map((x: any) => ({ id: x.id })),
            connect: state.value.filter((x: any) => !oldIds.includes(x.id)).map((x: any) => ({ id: x.id })),
          },
          [orderFieldKey]: newIds,
        };
      }
      return {};
    },
  };
}
