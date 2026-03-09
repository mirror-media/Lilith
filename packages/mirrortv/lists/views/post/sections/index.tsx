/** @jsxRuntime classic */
/** @jsx jsx */

import { Fragment, useRef, useState, useEffect } from 'react'

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
import { gql, useQuery } from '@keystone-6/core/admin-ui/apollo'
import {
  CellContainer,
  CreateItemDrawer,
} from '@keystone-6/core/admin-ui/components'

import { Cards } from './cards'
import { RelationshipSelect } from './RelationshipSelect'
import { sectionsManager } from '../categories/sectionsContext'

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

  // 當 sections 的值變化時，通知 categories
  useEffect(() => {
    if (value.kind === 'many' && Array.isArray(value.value)) {
      const sectionIds = value.value.map((item: any) => item.id).filter(Boolean)
      sectionsManager.updateSections(sectionIds)
    }
  }, [value])

  /**
   * use Ref to prevent infinite re-render
   * autofill only trigger during item creation
   */
  const isAssignedRef = useRef(value.id !== null)
  const { data } = useQuery(
    gql`
      query GetSections($where: SectionWhereInput! = {}, $userId: ID!) {
        sections(where: $where) {
          id
          label: name
        }
        user(where: { id: $userId }) {
          author {
            sections {
              id
              label: name
            }
          }
        }
      }
    `,
    {
      variables: {
        where: { name: { equals: '即時' } },
        // @ts-ignore: authenticatedItem.id exists
        userId: keystone.authenticatedItem.id,
      },
    }
  )

  if (isAssignedRef.current === false && data) {
    const sections: any[] = []
    const idSet = new Set()

    const iteratorFn = (item: Value) => {
      const id = item.id

      if (!idSet.has(id)) {
        idSet.add(id)

        sections.push({
          id: item.id,
          label: item.label,
        })
      }
    }

    if (Array.isArray(data.sections) && data.sections.length > 0) {
      // set `即時` section as default
      data.sections.forEach(iteratorFn)
    }

    if (
      Array.isArray(data.user?.author?.sections) &&
      data.user.author.sections.length > 0
    ) {
      // add user related sections
      data.user.author.sections.forEach(iteratorFn)
    }

    const update = Object.assign({}, value)

    if (sections.length > 0 && typeof onChange === 'function') {
      Object.assign(update, {
        ...update,
        value: sections,
      })

      onChange(update)
      isAssignedRef.current = true
    }
  }

  if (value.kind === 'cards-view') {
    return (
      <FieldContainer as="fieldset">
        <FieldLegend>{field.label}</FieldLegend>
        <FieldDescription id={`${field.path}-description`}>
          {field.description}
        </FieldDescription>
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
type CardsRelationshipValue = {
  kind: 'cards-view'
  id: null | string
  itemsBeingEdited: ReadonlySet<string>
  itemBeingCreated: boolean
  initialIds: ReadonlySet<string>
  currentIds: ReadonlySet<string>
  displayOptions: CardsDisplayModeOptions
}
type CountRelationshipValue = {
  kind: 'count'
  id: null | string
  count: number
}
type CardsDisplayModeOptions = {
  cardFields: readonly string[]
  linkToItem: boolean
  removeMode: 'disconnect' | 'none'
  inlineCreate: { fields: readonly string[] } | null
  inlineEdit: { fields: readonly string[] } | null
  inlineConnect: boolean
}

type RelationshipController = FieldController<
  | ManyRelationshipValue
  | SingleRelationshipValue
  | CardsRelationshipValue
  | CountRelationshipValue,
  string
> & {
  display: 'count' | 'cards-or-select'
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
          displayMode: 'cards'
          cardFields: readonly string[]
          linkToItem: boolean
          removeMode: 'disconnect' | 'none'
          inlineCreate: { fields: readonly string[] } | null
          inlineEdit: { fields: readonly string[] } | null
          inlineConnect: boolean
        }
      | {
          displayMode: 'count'
        }
    )
  >
): RelationshipController => {
  const cardsDisplayOptions =
    config.fieldMeta.displayMode === 'cards'
      ? {
          cardFields: config.fieldMeta.cardFields,
          inlineCreate: config.fieldMeta.inlineCreate,
          inlineEdit: config.fieldMeta.inlineEdit,
          linkToItem: config.fieldMeta.linkToItem,
          removeMode: config.fieldMeta.removeMode,
          inlineConnect: config.fieldMeta.inlineConnect,
        }
      : undefined

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
      config.fieldMeta.displayMode === 'count' ? 'count' : 'cards-or-select',
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
    // note we're not making the state kind: 'count' when ui.displayMode is set to 'count'.
    // that ui.displayMode: 'count' is really just a way to have reasonable performance
    // because our other UIs don't handle relationships with a large number of items well
    // but that's not a problem here since we're creating a new item so we might as well them a better UI
    defaultValue:
      cardsDisplayOptions !== undefined
        ? {
            kind: 'cards-view',
            currentIds: new Set(),
            id: null,
            initialIds: new Set(),
            itemBeingCreated: false,
            itemsBeingEdited: new Set(),
            displayOptions: cardsDisplayOptions,
          }
        : config.fieldMeta.many
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
      if (cardsDisplayOptions !== undefined) {
        const initialIds = new Set<string>(
          (Array.isArray(data[config.path])
            ? data[config.path]
            : data[config.path]
            ? [data[config.path]]
            : []
          ).map((x: any) => x.id)
        )
        return {
          kind: 'cards-view',
          id: data.id,
          itemsBeingEdited: new Set(),
          itemBeingCreated: false,
          initialIds,
          currentIds: initialIds,
          displayOptions: cardsDisplayOptions,
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
      // @ts-ignore
      Filter: ({ onChange, value }) => {
        const foreignList = useList(config.fieldMeta.refListKey)
        const { filterValues, loading } = useRelationshipFilterValues({
          value,
          list: foreignList,
        })
        const state: {
          kind: 'many'
          value: Value[]
          onChange: (newItems: Value[]) => void
        } = {
          kind: 'many',
          value: filterValues,
          onChange(newItems) {
            onChange(newItems.map((item) => item.id).join(','))
          },
        }
        return (
          <RelationshipSelect
            controlShouldRenderValue
            list={foreignList}
            labelField={refLabelField}
            searchFields={refSearchFields}
            isLoading={loading}
            isDisabled={onChange === undefined}
            state={state}
            orderBy={[{ id: 'desc' }]}
          />
        )
      },
      graphql: ({ value }) => {
        const foreignIds = getForeignIds(value)
        if (config.fieldMeta.many) {
          return {
            [config.path]: {
              some: {
                id: {
                  in: foreignIds,
                },
              },
            },
          }
        }
        return {
          [config.path]: {
            id: {
              in: foreignIds,
            },
          },
        }
      },
      Label({ value }) {
        const foreignList = useList(config.fieldMeta.refListKey)
        const { filterValues } = useRelationshipFilterValues({
          value,
          list: foreignList,
        })

        if (!filterValues.length) {
          return `has no value`
        }
        if (filterValues.length > 1) {
          const values = filterValues.map((i: any) => i.label).join(', ')
          return `is in [${values}]`
        }
        const optionLabel = filterValues[0].label
        return `is ${optionLabel}`
      },
      types: {
        matches: {
          label: 'Matches',
          initialValue: '',
        },
      },
    },
    validate(value) {
      return (
        value.kind !== 'cards-view' ||
        (value.itemsBeingEdited.size === 0 && !value.itemBeingCreated)
      )
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
      } else if (state.kind === 'cards-view') {
        const disconnect = [...state.initialIds]
          .filter((id) => !state.currentIds.has(id))
          .map((id) => ({ id }))
        const connect = [...state.currentIds]
          .filter((id) => !state.initialIds.has(id))
          .map((id) => ({ id }))

        if (config.fieldMeta.many) {
          if (disconnect.length || connect.length) {
            return {
              [config.path]: {
                connect: connect.length ? connect : undefined,
                disconnect: disconnect.length ? disconnect : undefined,
              },
            }
          }
        } else if (connect.length) {
          return {
            [config.path]: {
              connect: connect[0],
            },
          }
        } else if (disconnect.length) {
          return { [config.path]: { disconnect: true } }
        }
      }
      return {}
    },
  }
}

function useRelationshipFilterValues({
  value,
  list,
}: {
  value: string
  list: ListMeta
}) {
  const foreignIds = getForeignIds(value)
  const where = { id: { in: foreignIds } }

  const query = gql`
    query FOREIGNLIST_QUERY($where: ${list.gqlNames.whereInputName}!) {
      items: ${list.gqlNames.listQueryName}(where: $where) {
        id
        ${list.labelField}
      }
    }
  `

  const { data, loading } = useQuery(query, {
    variables: {
      where,
    },
  })

  return {
    filterValues:
      data?.items?.map((item: any) => {
        return {
          id: item.id,
          label: item[list.labelField] || item.id,
        }
      }) || foreignIds.map((f) => ({ label: f, id: f })),
    loading: loading,
  }
}

function getForeignIds(value: string) {
  if (typeof value === 'string' && value.length > 0) {
    return value.split(',')
  }
  return []
}
