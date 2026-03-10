/** @jsxRuntime classic */
/** @jsx jsx */
import 'intersection-observer'
import { RefObject, useEffect, useMemo, useState, createContext, useContext, useRef } from 'react'
import { jsx } from '@keystone-ui/core'
import { MultiSelect, Select, selectComponents } from '@keystone-ui/fields'
import { validate as validateUUID } from 'uuid'
import { IdFieldConfig, ListMeta } from '@keystone-6/core/types'
import { ApolloClient, gql, InMemoryCache, TypedDocumentNode, useApolloClient, useQuery } from '@keystone-6/core/admin-ui/apollo'

const idFieldAlias = '____id____'
const labelFieldAlias = '____label____'
const LoadingIndicatorContext = createContext<{ count: number; ref: (element: HTMLElement | null) => void }>({
  count: 0,
  ref: () => {},
})

export const RelationshipSelect = ({
  autoFocus, controlShouldRenderValue, isDisabled, isLoading, labelField, searchFields, list, placeholder, portalMenu, state, extraSelection = '', orderBy,
}: any) => {
  const [search, setSearch] = useState('')
  const [loadingIndicatorElement, setLoadingIndicatorElement] = useState<null | HTMLElement>(null)
  const link = useApolloClient().link

  const apolloClient = useMemo(() => new ApolloClient({
    link,
    cache: new InMemoryCache({
      typePolicies: { Query: { fields: { [list.gqlNames.listQueryName]: { keyArgs: ['where'], merge(existing: any[] = [], incoming: any[], { args }: any) {
        const merged = existing.slice(); for (let i = 0; i < incoming.length; ++i) merged[args.skip + i] = incoming[i]; return merged;
      }}}}}}),
  }), [link, list.gqlNames.listQueryName])

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

  const { data, loading, fetchMore } = useQuery(QUERY, {
    fetchPolicy: 'network-only',
    variables: { where: { OR: search ? [{ [labelField]: { contains: search, mode: 'insensitive' } }] : [] }, take: 50, skip: 0, orderBy },
    client: apolloClient,
  })

  const options = data?.items?.map((item: any) => ({ value: item[idFieldAlias], label: item[labelFieldAlias] || item[idFieldAlias], data: item })) || []

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
    <LoadingIndicatorContext.Provider value={{ count: data?.count || 0, ref: setLoadingIndicatorElement }}>
      {state.kind === 'many' ? (
        <MultiSelect
          {...commonProps}
          value={state.value.map((v: any) => ({ value: v.id, label: v.label, data: v.data }))}
          onChange={(newValue: any) => {
            state.onChange(newValue.map((x: any) => ({ id: x.value, label: x.label, data: x.data })))
          }}
          formatOptionLabel={(option: any) => (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span>{option.label}</span>
              {list.label === 'Photos' && option.data?.imageFile?.url && (
                <img src={option.data.imageFile.url} width={30} height={30} style={{ marginLeft: 'auto', objectFit: 'cover' }} />
              )}
            </div>
          )}
        />
      ) : (
        <Select
          {...commonProps}
          value={state.value ? { value: state.value.id, label: state.value.label, data: state.value.data } : null}
          onChange={(v: any) => state.onChange(v ? { id: v.value, label: v.label, data: v.data } : null)}
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
        <div ref={ref} style={{ textAlign: 'center', padding: 8 }}>
          {props.options.length < count && 'Loading...'}
        </div>
      </selectComponents.MenuList>
    )
  },
}
