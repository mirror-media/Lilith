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
import { validate as validateUUID } from 'uuid'
import { IdFieldConfig, ListMeta } from '@keystone-6/core/types'
import {
  gql,
  TypedDocumentNode,
  useApolloClient,
  useQuery,
} from '@keystone-6/core/admin-ui/apollo'
import { sectionsManager } from './sectionsContext'

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
  currentItemId,
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
  state: any
  extraSelection?: string
  orderBy: Record<string, any>[]
  currentItemId: string | null
}) => {
  const [search, setSearch] = useState('')
  const [loadingIndicatorElement, setLoadingIndicatorElement] = useState<null | HTMLElement>(null)
  
  const client = useApolloClient()

  const { data: postData } = useQuery(
    gql`
      query GetPostSections($id: ID!) {
        post(where: { id: $id }) {
          id
          sections {
            id
          }
        }
      }
    `,
    {
      variables: { id: currentItemId },
      skip: !currentItemId,
    }
  )

  const [currentSections, setCurrentSections] = useState<string[]>(
    postData?.post?.sections?.map((s: any) => s.id) || []
  )

  useEffect(() => {
    if (postData?.post?.sections) {
      const sectionIds = postData.post.sections.map((s: any) => s.id)
      setCurrentSections(sectionIds)
      sectionsManager.updateSections(sectionIds)
    }
  }, [postData?.post?.sections])

  useEffect(() => {
    const unsubscribe = sectionsManager.subscribe((sectionIds) => {
      setCurrentSections(sectionIds)
    })
    return unsubscribe
  }, [])

  const selectedSections = currentSections

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
  const searchFilter = useFilter(debouncedSearch, list, searchFields)

  const where = useMemo(() => {
    const conditions: any = {}
    if (searchFilter.OR && searchFilter.OR.length > 0) {
      Object.assign(conditions, searchFilter)
    }
    if (selectedSections && selectedSections.length > 0) {
      conditions.sections = { some: { id: { in: selectedSections } } }
    }
    return conditions
  }, [searchFilter, selectedSections])

  const { data, error, loading, fetchMore, refetch } = useQuery(QUERY, {
    fetchPolicy: 'cache-and-network',
    variables: { where, take: 50, skip: 0, orderBy },
    client: client,
  })

  useEffect(() => {
    const handleRefresh = () => {
      refetch()
    }
    window.addEventListener('REFRESH_RELATIONSHIPS', handleRefresh)
    return () => window.removeEventListener('REFRESH_RELATIONSHIPS', handleRefresh)
  }, [refetch])

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
        fetchMore({
          variables: { where, take: 50, skip, orderBy },
        })
      }
    },
    { current: loadingIndicatorElement }
  )

  if (error) return <span>載入發生錯誤</span>

  const commonProps = {
    onInputChange: (val: string) => setSearch(val),
    isLoading: loading || isLoading,
    autoFocus,
    components: relationshipSelectComponents,
    portalMenu,
    options,
    placeholder,
    controlShouldRenderValue,
    isClearable: controlShouldRenderValue,
    isDisabled,
  }

  return (
    <LoadingIndicatorContext.Provider value={{ count, ref: setLoadingIndicatorElement }}>
      {state.kind === 'many' ? (
        <MultiSelect
          {...commonProps}
          value={state.value.map((v: any) => ({ value: v.id, label: v.label, data: v.data }))}
          onChange={(value: any) => {
            state.onChange(value.map((x: any) => ({ id: x.value, label: x.label, data: x.data })))
          }}
        />
      ) : (
        <Select
          {...commonProps}
          value={state.value ? { value: state.value.id, label: state.value.label, data: state.value.data } : null}
          onChange={(value: any) => {
            state.onChange(value ? { id: value.value, label: value.label, data: value.data } : null)
          }}
        />
      )}
    </LoadingIndicatorContext.Provider>
  )
}

const relationshipSelectComponents: Partial<typeof selectComponents> = {
  MenuList: ({ children, ...props }: any) => {
    const { count, ref } = useContext(LoadingIndicatorContext)
    return (
      <selectComponents.MenuList {...props}>
        {children}
        <div css={{ textAlign: 'center', padding: '8px' }} ref={ref}>
          {props.options.length < count && <span>載入中...</span>}
        </div>
      </selectComponents.MenuList>
    )
  },
}
