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

import { jsx } from '@keystone-ui/core';
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
import { State } from '../../../type'

enum PostStatus {
  Published = State.Published,
  Draft = State.Draft,
  Scheduled = State.Scheduled,
  Archived = State.Archived,
  Invisible = State.Invisible,
}

const idFieldAlias = '____id____'
const labelFieldAlias = '____label____'

// --- Helper Functions ---

function useIntersectionObserver(cb: IntersectionObserverCallback, ref: RefObject<any>) {
  const cbRef = useRef(cb)
  useEffect(() => {
    cbRef.current = cb
  })
  useEffect(() => {
    const observer = new IntersectionObserver((...args) => cbRef.current(...args), {})
    const node = ref.current
    if (node !== null) {
      observer.observe(node)
      return () => observer.unobserve(node)
    }
  }, [ref])
}

const idValidators = {
  uuid: validateUUID,
  cuid(value: string) { return value.startsWith('c') },
  autoincrement(value: string) { return /^\d+$/.test(value) },
}

function useDebouncedValue<T>(value: T, limitMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState(() => value)
  useEffect(() => {
    const id = setTimeout(() => setDebouncedValue(() => value), limitMs)
    return () => clearTimeout(id)
  }, [value, limitMs])
  return debouncedValue
}

export function useFilter(search: string, list: ListMeta, searchFields: string[]) {
  return useMemo(() => {
    if (!search.length) return { OR: [] }
    const idFieldKind: IdFieldConfig['kind'] = (list.fields.id.controller as any).idFieldKind
    const trimmedSearch = search.trim()
    const isValidId = idValidators[idFieldKind](trimmedSearch)

    const conditions: Record<string, any>[] = []
    if (isValidId) conditions.push({ id: { equals: trimmedSearch } })

    for (const fieldKey of searchFields) {
      const field = list.fields[fieldKey]
      if (field) {
        conditions.push({
          [field.path]: {
            contains: trimmedSearch,
            mode: field.search === 'insensitive' ? 'insensitive' : undefined,
          },
        })
      }
    }
    return { OR: conditions }
  }, [search, list, searchFields])
}

const LoadingIndicatorContext = createContext<{
  count: number
  ref: (element: HTMLElement | null) => void
}>({
  count: 0,
  ref: () => {},
})

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
  currentPostId,
}: any) => {
  const [search, setSearch] = useState('')
  const [loadingIndicatorElement, setLoadingIndicatorElement] = useState<null | HTMLElement>(null)

  const QUERY: TypedDocumentNode<any, any> = gql`
    query RelationshipSelect($where: ${list.gqlNames.whereInputName}!, $take: Int!, $skip: Int!, $orderBy: [${list.gqlNames.listOrderName}!]!) {
      items: ${list.gqlNames.listQueryName}(where: $where, take: $take, skip: $skip, orderBy: $orderBy) {
        ${idFieldAlias}: id
        ${labelFieldAlias}: ${labelField}
        state
        ${extraSelection}
      }
      count: ${list.gqlNames.listQueryCountName}(where: $where)
    }
  `

  const debouncedSearch = useDebouncedValue(search, 200)
  const where = useFilter(debouncedSearch, list, searchFields)

  const link = useApolloClient().link
  const apolloClient = useMemo(() => new ApolloClient({
    link,
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            [list.gqlNames.listQueryName]: {
              keyArgs: ['where'],
              merge(existing = [], incoming, { args }) {
                const merged = [...existing]
                const { skip = 0 } = args || {}
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
  }), [link, list.gqlNames.listQueryName])

  const { data, error, loading, fetchMore } = useQuery(QUERY, {
    fetchPolicy: 'network-only',
    variables: { where, take: 50, skip: 0, orderBy },
    client: apolloClient,
  })

  const options = useMemo(() => {
    if (!data?.items) return []
    const includesStates = [PostStatus.Published, PostStatus.Scheduled, PostStatus.Invisible]
    
    return data.items
      .map((item: any) => ({
        value: item[idFieldAlias],
        label: item[labelFieldAlias] || item[idFieldAlias],
        data: item,
      }))
      .filter((opt: any) => {
        const isCurrent = opt.value === currentPostId
        const shouldInclude = includesStates.includes(opt.data.state as PostStatus)
        return !isCurrent && shouldInclude
      })
  }, [data, currentPostId])

  useIntersectionObserver(
    ([{ isIntersecting }]) => {
      const skip = data?.items.length
      if (!loading && isIntersecting && options.length < (data?.count || 0)) {
        fetchMore({
          variables: { where, take: 50, skip, orderBy },
        })
      }
    },
    { current: loadingIndicatorElement }
  )

  if (error) return <span>Error loading relationships</span>

  const commonProps = {
    onInputChange: (val: string) => setSearch(val),
    isLoading: loading || isLoading,
    autoFocus,
    components: relationshipSelectComponents,
    portalMenu,
    placeholder,
    controlShouldRenderValue,
    isClearable: controlShouldRenderValue,
    isDisabled,
  }

  return (
    <LoadingIndicatorContext.Provider value={{ count: data?.count || 0, ref: setLoadingIndicatorElement }}>
      {state.kind === 'many' ? (
        <MultiSelect
          {...commonProps}
          value={state.value.map((v: any) => ({ value: v.id, label: v.label, data: v.data }))}
          options={options}
          onChange={(val) => {
            state.onChange(val.map((x: any) => ({ id: x.value, label: x.label, data: x.data })))
          }}
        />
      ) : (
        <Select
          {...commonProps}
          value={state.value ? { value: state.value.id, label: state.value.label, data: state.value.data } : null}
          options={options}
          onChange={(val) => {
            state.onChange(val ? { id: val.value, label: val.label, data: (val as any).data } : null)
          }}
        />
      )}
    </LoadingIndicatorContext.Provider>
  )
}

const relationshipSelectComponents: Partial<typeof selectComponents> = {
  MenuList: ({ children, ...props }) => {
    const { count, ref } = useContext(LoadingIndicatorContext)
    return (
      <selectComponents.MenuList {...props}>
        {children}
        <div css={{ textAlign: 'center', minHeight: 1 }} ref={ref}>
          {props.options.length < count && <span css={{ padding: 8, fontSize: '0.8em', color: '#666' }}>Loading more...</span>}
        </div>
      </selectComponents.MenuList>
    )
  },
}
