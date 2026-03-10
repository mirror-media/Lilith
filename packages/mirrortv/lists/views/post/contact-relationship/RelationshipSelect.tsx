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

// eslint-disable-next-line
import { jsx } from '@keystone-ui/core';
import { MultiSelect, Select, selectComponents } from '@keystone-ui/fields'
import { ListMeta } from '@keystone-6/core/types'
import {
  gql,
  TypedDocumentNode,
  useApolloClient,
  useQuery,
} from '@keystone-6/core/admin-ui/apollo'

// --- Helpers ---
function useIntersectionObserver(cb: IntersectionObserverCallback, ref: RefObject<any>) {
  const cbRef = useRef(cb)
  useEffect(() => { cbRef.current = cb })
  useEffect(() => {
    const observer = new IntersectionObserver((...args) => cbRef.current(...args), {})
    const node = ref.current
    if (node !== null) {
      observer.observe(node)
      return () => observer.unobserve(node)
    }
  }, [ref])
}

function useDebouncedValue<T>(value: T, limitMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState(() => value)
  useEffect(() => {
    const id = setTimeout(() => { setDebouncedValue(() => value) }, limitMs)
    return () => clearTimeout(id)
  }, [value, limitMs])
  return debouncedValue
}

export function useFilter(search: string, list: ListMeta, searchFields: string[]) {
  return useMemo(() => {
    if (!search.length) return { OR: [] }
    const trimmedSearch = search.trim()
    const conditions: Record<string, any>[] = []
    for (const fieldKey of searchFields) {
      const field = list.fields[fieldKey]
      if (field) {
        conditions.push({
          [field.path]: { contains: trimmedSearch, mode: 'insensitive' },
        })
      }
    }
    return { OR: conditions }
  }, [search, list, searchFields])
}

const idFieldAlias = '____id____'
const labelFieldAlias = '____label____'

const LoadingIndicatorContext = createContext<{
  count: number
  ref: (element: HTMLElement | null) => void
}>({ count: 0, ref: () => {} })

export const RelationshipSelect = ({
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
}: any) => {
  const [search, setSearch] = useState('')
  const [loadingIndicatorElement, setLoadingIndicatorElement] = useState<null | HTMLElement>(null)

  const client = useApolloClient()

  const QUERY: TypedDocumentNode<any, any> = gql`
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
  const where = useFilter(debouncedSearch, list, searchFields)

  const { data, loading, fetchMore, refetch } = useQuery(QUERY, {
    fetchPolicy: 'cache-and-network',
    variables: { where, take: 50, skip: 0, orderBy: orderBy || [{ [labelField]: 'asc' }] },
    client: client,
  })

  // 💡 【新增】監聽來自 index.tsx 的全域刷新事件
  useEffect(() => {
    const handleRefresh = () => {
      console.log(`[RelationshipSelect] 收到刷新訊號，正在重新抓取 ${list.key} 的資料...`)
      refetch()
    }
    window.addEventListener('REFRESH_RELATIONSHIPS', handleRefresh)
    return () => {
      window.removeEventListener('REFRESH_RELATIONSHIPS', handleRefresh)
    }
  }, [refetch, list.key])

  useEffect(() => {
    if (debouncedSearch === '') {
      refetch()
    }
  }, [debouncedSearch, refetch])

  const count = data?.count || 0
  const options = data?.items?.map(({ [idFieldAlias]: value, [labelFieldAlias]: label, ...data }: any) => ({
    value,
    label: label || value,
    data,
  })) || []

  useIntersectionObserver(
    ([{ isIntersecting }]) => {
      const skip = data?.items?.length
      if (!loading && skip && isIntersecting && options.length < count) {
        fetchMore({ variables: { where, take: 50, skip, orderBy: orderBy || [{ [labelField]: 'asc' }] } })
      }
    },
    { current: loadingIndicatorElement }
  )

  if (state.kind === 'many') {
    return (
      <LoadingIndicatorContext.Provider value={{ count, ref: setLoadingIndicatorElement }}>
        <MultiSelect
          onInputChange={setSearch}
          isLoading={loading || isLoading}
          autoFocus={autoFocus}
          components={relationshipSelectComponents}
          portalMenu={portalMenu}
          value={(state.value as any[]).map(v => ({
            value: v.id,
            label: v.label,
            data: v.data,
          })) as any}
          options={options as any}
          onChange={(newValues: any) => {
            state.onChange(newValues.map((x: any) => ({
              id: x.value,
              label: x.label,
              data: x.data,
            })))
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
    <LoadingIndicatorContext.Provider value={{ count, ref: setLoadingIndicatorElement }}>
      <Select
        onInputChange={setSearch}
        isLoading={loading || isLoading}
        autoFocus={autoFocus}
        components={relationshipSelectComponents}
        portalMenu={portalMenu}
        value={state.value ? ({
          value: state.value.id,
          label: state.value.label,
          data: state.value.data,
        } as any) : null}
        options={options as any}
        onChange={(val: any) => {
          state.onChange(val ? { id: val.value, label: val.label, data: val.data } : null)
        }}
        placeholder={placeholder}
        controlShouldRenderValue={controlShouldRenderValue}
        isClearable={controlShouldRenderValue}
        isDisabled={isDisabled}
      />
    </LoadingIndicatorContext.Provider>
  )
}

const relationshipSelectComponents: Partial<typeof selectComponents> = {
  MenuList: ({ children, ...props }: any) => {
    const { count, ref } = useContext(LoadingIndicatorContext)
    return (
      <selectComponents.MenuList {...props}>
        {children}
        <div css={{ textAlign: 'center' }} ref={ref}>
          {props.options.length < count && (
            <span css={{ padding: 8, fontSize: '12px', color: '#666' }}>載入中...</span>
          )}
        </div>
      </selectComponents.MenuList>
    )
  },
}
