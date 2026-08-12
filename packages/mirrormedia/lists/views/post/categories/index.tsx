/** @jsxRuntime classic */
/** @jsx jsx */

import { Fragment, useState, useEffect, useRef } from 'react'

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
import { gql, useApolloClient } from '@keystone-6/core/admin-ui/apollo'
import {
  CellContainer,
  CreateItemDrawer,
} from '@keystone-6/core/admin-ui/components'

import { RelationshipSelect } from './RelationshipSelect'
import { fieldFilterManager } from '../../shared/fieldFilterManager'
import { useDialogScope } from '../../shared/useDialogScope'

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
}: FieldProps<typeof controller>) => {
  const keystone = useKeystone()
  const foreignList = useList(field.refListKey)
  const localList = useList(field.listKey)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const { anchorRef, scopedKey } = useDialogScope()

  // 組件卸載時，移除此 scope 的全域狀態（用 clearField 連 key 一起刪，避免累積殘留）
  useEffect(() => {
    return () => {
      fieldFilterManager.clearField(scopedKey('categories'))
    }
  }, [])

  // 當 categories 值改變，把目前選取的 category IDs 存進 fieldFilterManager
  // 讓 state 欄位的 validate 能判斷「已發布/預約發布時 categories 是否有值」
  useEffect(() => {
    if (value.kind === 'many' && Array.isArray(value.value)) {
      const categoryIds = value.value
        .map((item: any) => item.id)
        .filter(Boolean)
      fieldFilterManager.updateField(scopedKey('categories'), categoryIds)
    }
  }, [value])

  // ── 大分類(sections)換掉時，自動移除「不再隸屬於目前大分類」的小分類
  const apolloClient = useApolloClient()
  const [selectedSections, setSelectedSections] = useState<string[]>([])
  useEffect(() => {
    const unsubscribe = fieldFilterManager.subscribe(
      scopedKey('sections'),
      (ids) => {
        setSelectedSections((prevIds) => {
          const same =
            prevIds.length === ids.length &&
            prevIds.every((id) => ids.includes(id))
          return same ? prevIds : ids
        })
      }
    )
    return unsubscribe
  }, [])

  // 記住「上一次的非空大分類組合」,用來偵測是否有大分類被移除
  const lastSectionsRef = useRef<string[] | null>(null)
  useEffect(() => {
    if (value.kind !== 'many') return
    if (selectedSections.length === 0) return // 清空 → 保留;不更新 last(維持上一組非空)

    const last = lastSectionsRef.current
    lastSectionsRef.current = selectedSections

    if (last === null) return

    const removedAny = last.some((id) => !selectedSections.includes(id))
    if (!removedAny) return

    const selectedCategoryIds = value.value.map((c) => c.id).filter(Boolean)
    if (selectedCategoryIds.length === 0) return

    let cancelled = false
    apolloClient
      .query<{ items: { id: string }[] }>({
        query: gql`
          query CategoriesUnderSections($where: ${foreignList.gqlNames.whereInputName}!) {
            items: ${foreignList.gqlNames.listQueryName}(where: $where) {
              id
            }
          }
        `,
        variables: {
          where: {
            AND: [
              { id: { in: selectedCategoryIds } },
              { sections: { some: { id: { in: selectedSections } } } },
            ],
          },
        },
        fetchPolicy: 'network-only',
      })
      .then(({ data }) => {
        if (cancelled || value.kind !== 'many') return
        const validIds = new Set((data?.items ?? []).map((i) => i.id))
        const kept = value.value.filter((c) => validIds.has(c.id))
        if (kept.length !== value.value.length) {
          onChange?.({ ...value, value: kept })
        }
      })
      .catch((err) => {
        // 查詢失敗就不動(fail-safe:不亂清小分類),但留下線索方便日後查問題
        console.error('[categories] 檢查小分類是否隸屬大分類的查詢失敗:', err)
      })

    return () => {
      cancelled = true
    }
  }, [selectedSections])

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
      <span ref={anchorRef} hidden />
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
                      // 同步更新 fieldFilterManager，確保父元件重新 render 時 validate() 能讀到最新值
                      fieldFilterManager.updateField(
                        scopedKey('categories'),
                        newItems.map((item: any) => item.id).filter(Boolean)
                      )
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
            currentItemId={value.id}
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
                  const newValue = [...value.value, val]
                  fieldFilterManager.updateField(
                    scopedKey('categories'),
                    newValue.map((item: any) => item.id).filter(Boolean)
                  )
                  onChange({
                    ...value,
                    value: newValue,
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

// @ts-ignore keystone relationship view type
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
          {/* @ts-ignore keystone Link type */}
          <Link href={`/${list.path}/${item.id}`} css={styles}>
            {item.label || item.id}
          </Link>
        </Fragment>
      ))}
      {overflow ? `, and ${overflow} more` : null}
    </CellContainer>
  )
}

// @ts-ignore keystone relationship view type
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
            {/* @ts-ignore keystone Link type */}
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
type CountRelationshipValue = {
  kind: 'count'
  id: null | string
  count: number
}

type RelationshipController = FieldController<
  ManyRelationshipValue | SingleRelationshipValue | CountRelationshipValue,
  string
> & {
  display: 'count' | 'select'
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
          displayMode: 'count'
        }
    )
  >
): RelationshipController => {
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
    deserialize: (data) => {
      if (config.fieldMeta.displayMode === 'count') {
        return {
          id: data.id,
          kind: 'count',
          count: data[`${config.path}Count`] ?? 0,
        }
      }
      if (config.fieldMeta.many) {
        const value = (data[`${config.path}InInputOrder`] || []).map(
          (x: any) => ({
            id: x.id,
            label: x.label || x.id,
          })
        )
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
    validate() {
      return true
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
      }
      return {}
    },
  }
}
