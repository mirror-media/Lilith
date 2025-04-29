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
  // To avoid @typescript-eslint/no-empty-function,
  // add a console log.
  ref: () => {
    console.log('ref function called')
  },
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
  currentPostId?: string
}) => {
  const [search, setSearch] = useState('')
  const [loadingIndicatorElement, setLoadingIndicatorElement] =
    useState<null | HTMLElement>(null)

  const QUERY: TypedDocumentNode<
    {
      items: { [idFieldAlias]: string; 
               [labelFieldAlias]: string | null;
               state: string
      }[]
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
        state
      }
      count: ${list.gqlNames.listQueryCountName}(where: $where)
    }
  `

  const debouncedSearch = useDebouncedValue(search, 200)
  const where = useFilter(debouncedSearch, list, searchFields)

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
    const includesStates = [PostStatus.Published, PostStatus.Scheduled, PostStatus.Invisible];
    const filteredOptions = useMemo(() => {
      return options.filter((option) => {
        const isCurrent = option.value === currentPostId;
        const optionState = option.data?.state as PostStatus;
        const shouldInclude = includesStates.includes(optionState);
    
        return !isCurrent && shouldInclude;
      });
    }, [options, currentPostId]);
    

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
        filteredOptions.length < count &&
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
                  state
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
                  // eslint-disable-next-line
                  // @ts-ignore
                  data: state.value.data,
                }
              : null
          }
          options={filteredOptions}
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
        options={filteredOptions}
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
        formatOptionLabel={(option) => {
          return (
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <span>{option.label}</span>
              {list.label === 'Photos' && (
                <img
                  src={option?.data?.imageFile?.url}
                  width={50}
                  height={50}
                  style={{ objectFit: 'cover', marginLeft: 'auto' }}
                  alt=""
                ></img>
              )}
            </div>
          )
        }}
      />
    </LoadingIndicatorContext.Provider>
  )
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
