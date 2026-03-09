/** @jsxRuntime classic */
/** @jsx jsx */

import 'intersection-observer'
import {
  RefObject,
  useEffect,
  useMemo,
  useState,
  createContext,
  useContext,
  useRef,
} from 'react'
import { jsx } from '@keystone-ui/core'
import { MultiSelect, Select, selectComponents } from '@keystone-ui/fields'
import { validate as validateUUID } from 'uuid'
import { IdFieldConfig, ListMeta } from '@keystone-6/core/types'
import {
  ApolloClient,
  gql,
  InMemoryCache,
  TypedDocumentNode,
  useApolloClient,
  useQuery,
} from '@keystone-6/core/admin-ui/apollo'
import { fieldFilterManager } from './fieldFilterManager'

type FilterConfig = {
  sourceField: string
  filterByField: string
  emptyMessage?: string
}

function useIntersectionObserver(
  cb: IntersectionObserverCallback,
  ref: RefObject<any>
) {
  const cbRef = useRef(cb)
  useEffect(() => {
    cbRef.current = cb
  })
  useEffect(() => {
    const observer = new IntersectionObserver(
      (...args) => cbRef.current(...args),
      {}
    )
    const node = ref.current
    if (node !== null) {
      observer.observe(node)
      return () => observer.unobserve(node)
    }
  }, [ref])
}

const idValidators = {
  uuid: validateUUID,
  cuid(value: string) {
    return value.startsWith('c')
  },
  autoincrement(value: string) {
    return /^\d+$/.test(value)
  },
}

function useDebouncedValue<T>(value: T, limitMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState(() => value)

  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedValue(() => value)
    }, limitMs)
    return () => {
      clearTimeout(id)
    }
  }, [value, limitMs])
  return debouncedValue
}

export function useFilter(
  search: string,
  list: ListMeta,
  searchFields: string[]
) {
  return useMemo(() => {
    if (!search.length) return { OR: [] }

    const idFieldKind: IdFieldConfig['kind'] = (
      list.fields.id.controller as any
    ).idFieldKind
    const trimmedSearch = search.trim()
    const isValidId = idValidators[idFieldKind](trimmedSearch)

    const conditions: Record<string, any>[] = []
    if (isValidId) {
      conditions.push({ id: { equals: trimmedSearch } })
    }

    for (const fieldKey of searchFields) {
      const field = list.fields[fieldKey]
      conditions.push({
        [field.path]: {
          contains: trimmedSearch,
          mode: field.search === 'insensitive' ? 'insensitive' : undefined,
        },
      })
    }

    return { OR: conditions }
  }, [search, list, searchFields])
}

const idFieldAlias = '____id____'
const labelFieldAlias = '____label____'

const LoadingIndicatorContext = createContext<{
  count: number
  ref: (element: HTMLElement | null) => void
}>({
  count: 0,
  ref: () => {
    console.log('ref function called')
  },
})

/**
 * 創建一個過濾的 RelationshipSelect 組件
 */
export function createFilteredRelationshipSelect(config: FilterConfig) {
  return function RelationshipSelect({
    autoFocus,
    controlShouldRenderValue,
    isDisabled,
    isLoading,
    labelField,
    searchFields,
    list,
    placeholder,
    portalMenu,
    state,
    extraSelection = '',
    orderBy,
    sourceFieldIds,
  }: {
    autoFocus?: boolean
    controlShouldRenderValue: boolean
    isDisabled: boolean
    isLoading?: boolean
    labelField: string
    searchFields: string[]
    list: ListMeta
    placeholder?: string
    portalMenu?: true | undefined
    state:
      | {
          kind: 'many'
          value: { label: string; id: string; data?: Record<string, any> }[]
          onChange(
            value: { label: string; id: string; data: Record<string, any> }[]
          ): void
        }
      | {
          kind: 'one'
          value: { label: string; id: string; data?: Record<string, any> } | null
          onChange(
            value: { label: string; id: string; data: Record<string, any> } | null
          ): void
        }
    extraSelection?: string
    orderBy: Record<string, any>[]
    sourceFieldIds: string[]
  }) {
    const [search, setSearch] = useState('')
    const [loadingIndicatorElement, setLoadingIndicatorElement] =
      useState<null | HTMLElement>(null)

    // 使用 state 來追蹤當前的源欄位值
    const [currentSourceIds, setCurrentSourceIds] = useState<string[]>(sourceFieldIds)

    // 訂閱源欄位的變化
    useEffect(() => {
      const unsubscribe = fieldFilterManager.subscribe(config.sourceField, (ids) => {
        setCurrentSourceIds(ids)
      })
      return unsubscribe
    }, [])

    // 初始化時也設置一次
    useEffect(() => {
      if (sourceFieldIds.length > 0) {
        fieldFilterManager.updateField(config.sourceField, sourceFieldIds)
      }
    }, [sourceFieldIds])

    const selectedSourceIds = currentSourceIds

    const QUERY: TypedDocumentNode<
      {
        items: { [idFieldAlias]: string; [labelFieldAlias]: string | null }[]
        count: number
      },
      {
        where: Record<string, any>
        take: number
        skip: number
        orderBy: Record<string, any>[]
      }
    > = gql`
      query RelationshipSelect($where: ${list.gqlNames.whereInputName}!, $take: Int!, $skip: Int!, $orderBy: [${list.gqlNames.listOrderName}!]!) {
        items: ${list.gqlNames.listQueryName}(where: $where, take: $take, skip: $skip, orderBy: $orderBy) {
          ${idFieldAlias}: id
          ${labelFieldAlias}: ${labelField}
          ${extraSelection}
        }
        count: ${list.gqlNames.listQueryCountName}(where: $where)
      }
    `

    const debouncedSearch = useDebouncedValue(search, 200)
    const searchFilter = useFilter(debouncedSearch, list, searchFields)

    // 建立完整的 where 條件，包括源欄位過濾
    const where = useMemo(() => {
      const conditions: any = {}
      
      // 如果有搜尋條件，加入搜尋過濾
      if (searchFilter.OR && searchFilter.OR.length > 0) {
        Object.assign(conditions, searchFilter)
      }

      // 如果有選中的源欄位值，只顯示相關的項目
      if (selectedSourceIds.length > 0) {
        conditions[config.filterByField] = {
          some: {
            id: {
              in: selectedSourceIds,
            },
          },
        }
      }

      return conditions
    }, [searchFilter, selectedSourceIds])

    const link = useApolloClient().link
    const apolloClient = useMemo(
      () =>
        new ApolloClient({
          link,
          cache: new InMemoryCache({
            typePolicies: {
              Query: {
                fields: {
                  [list.gqlNames.listQueryName]: {
                    keyArgs: ['where'],
                    merge: (
                      existing: readonly unknown[],
                      incoming: readonly unknown[],
                      { args }
                    ) => {
                      const merged = existing ? existing.slice() : []
                      const { skip } = args!
                      for (let i = 0; i < incoming.length; ++i) {
                        merged[skip + i] = incoming[i]
                      }
                      return merged
                    },
                  },
                },
              },
            },
          }),
        }),
      [link, list.gqlNames.listQueryName]
    )

    const initialItemsToLoad = Math.min(list.pageSize, 10)
    const subsequentItemsToLoad = Math.min(list.pageSize, 50)
    const { data, error, loading, fetchMore } = useQuery(QUERY, {
      fetchPolicy: 'network-only',
      variables: { where, take: initialItemsToLoad, skip: 0, orderBy },
      client: apolloClient,
    })

    const count = data?.count || 0

    const options =
      data?.items?.map(
        ({ [idFieldAlias]: value, [labelFieldAlias]: label, ...data }) => ({
          value,
          label: label || value,
          data,
        })
      ) || []

    const loadingIndicatorContextVal = useMemo(
      () => ({
        count,
        ref: setLoadingIndicatorElement,
      }),
      [count]
    )

    const [lastFetchMore, setLastFetchMore] = useState<{
      where: Record<string, any>
      extraSelection: string
      list: ListMeta
      skip: number
    } | null>(null)

    useIntersectionObserver(
      ([{ isIntersecting }]) => {
        const skip = data?.items.length
        if (
          !loading &&
          skip &&
          isIntersecting &&
          options.length < count &&
          (lastFetchMore?.extraSelection !== extraSelection ||
            lastFetchMore?.where !== where ||
            lastFetchMore?.list !== list ||
            lastFetchMore?.skip !== skip)
        ) {
          const QUERY: TypedDocumentNode<
            {
              items: {
                [idFieldAlias]: string
                [labelFieldAlias]: string | null
              }[]
            },
            {
              where: Record<string, any>
              take: number
              skip: number
              orderBy: Record<string, any>[]
            }
          > = gql`
                query RelationshipSelectMore($where: ${list.gqlNames.whereInputName}!, $take: Int!, $skip: Int!, $orderBy: [${list.gqlNames.listOrderName}!]!) {
                  items: ${list.gqlNames.listQueryName}(where: $where, take: $take, skip: $skip, orderBy: $orderBy) {
                    ${labelFieldAlias}: ${labelField}
                    ${idFieldAlias}: id
                    ${extraSelection}
                  }
                }
              `
          setLastFetchMore({ extraSelection, list, skip, where })
          fetchMore({
            query: QUERY,
            variables: {
              where,
              take: subsequentItemsToLoad,
              skip,
              orderBy,
            },
          })
            .then(() => {
              setLastFetchMore(null)
            })
            .catch(() => {
              setLastFetchMore(null)
            })
        }
      },
      { current: loadingIndicatorElement }
    )

    if (error) {
      return <span>Error</span>
    }

    // 如果沒有選中任何源欄位值，顯示提示訊息
    if (selectedSourceIds.length === 0) {
      const message = config.emptyMessage || `請先選擇相關欄位`
      return (
        <div style={{ padding: '8px', color: '#666', fontStyle: 'italic' }}>
          {message}
        </div>
      )
    }

    if (state.kind === 'one') {
      return (
        <LoadingIndicatorContext.Provider value={loadingIndicatorContextVal}>
          <Select
            onInputChange={(val) => setSearch(val)}
            isLoading={loading || isLoading}
            autoFocus={autoFocus}
            components={relationshipSelectComponents}
            portalMenu={portalMenu}
            value={
              state.value
                ? {
                    value: state.value.id,
                    label: state.value.label,
                    // @ts-ignore
                    data: state.value.data,
                  }
                : null
            }
            options={options}
            onChange={(value) => {
              state.onChange(
                value
                  ? {
                      id: value.value,
                      label: value.label,
                      data: (value as any).data,
                    }
                  : null
              )
            }}
            placeholder={placeholder}
            controlShouldRenderValue={controlShouldRenderValue}
            isClearable={controlShouldRenderValue}
            isDisabled={isDisabled}
          />
        </LoadingIndicatorContext.Provider>
      )
    }

    return (
      <LoadingIndicatorContext.Provider value={loadingIndicatorContextVal}>
        <MultiSelect
          onInputChange={(val) => setSearch(val)}
          isLoading={loading || isLoading}
          autoFocus={autoFocus}
          components={relationshipSelectComponents}
          portalMenu={portalMenu}
          value={state.value.map((value) => ({
            value: value.id,
            label: value.label,
            data: value.data,
          }))}
          options={options}
          onChange={(value) => {
            state.onChange(
              value.map((x) => ({
                id: x.value,
                label: x.label,
                data: (x as any).data,
              }))
            )
          }}
          placeholder={placeholder}
          controlShouldRenderValue={controlShouldRenderValue}
          isClearable={controlShouldRenderValue}
          isDisabled={isDisabled}
        />
      </LoadingIndicatorContext.Provider>
    )
  }
}

const relationshipSelectComponents: Partial<typeof selectComponents> = {
  MenuList: ({ children, ...props }) => {
    const { count, ref } = useContext(LoadingIndicatorContext)
    return (
      <selectComponents.MenuList {...props}>
        {children}
        <div css={{ textAlign: 'center' }} ref={ref}>
          {props.options.length < count && (
            <span css={{ padding: 8 }}>Loading...</span>
          )}
        </div>
      </selectComponents.MenuList>
    )
  },
}

