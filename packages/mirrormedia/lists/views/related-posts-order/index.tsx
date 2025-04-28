import { useEffect, useState, Fragment } from 'react'
import { FieldContainer, FieldLabel, MultiSelect } from '@keystone-ui/fields'
import type {
  FieldProps,
  FieldControllerConfig,
  CellComponent,
} from '@keystone-6/core/types'
import { useList } from '@keystone-6/core/admin-ui/context'
import { Link } from '@keystone-6/core/admin-ui/router'
import { CellContainer } from '@keystone-6/core/admin-ui/components'
import { useQuery, gql } from '@keystone-6/core/admin-ui/apollo'
import { useTheme } from '@keystone-ui/core'

const RELATED_POSTS_QUERY = gql`
  query {
    posts {
      id
      slug
    }
  }
`

type RelatedPostsQueryData = {
  posts: {
    id: string
    slug: string
  }[]
}

type Selection = {
  label: string
  value: string
}

export const Field = ({
  value,
  onChange,
  autoFocus,
  field,
}: FieldProps<typeof controller>) => {
  const { data, error, loading } =
    useQuery<RelatedPostsQueryData>(RELATED_POSTS_QUERY)
  const [options, setOptions] = useState<Selection[]>([])

  useEffect(() => {
    if (data?.posts) {
      const formatted = data.posts.map(({ id, slug }) => ({
        label: slug,
        value: id,
      }))
      setOptions(formatted)
    }
  }, [data])

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error loading posts: {error.message}</div>
  }

  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      <MultiSelect
        options={options}
        value={((value as RelatedPostsQueryData['posts']) || []).map(
          (post) => ({
            label: post.slug,
            value: post.id,
          })
        )}
        onChange={(newValue) => {
          onChange?.(
            newValue.map((item) => ({ id: item.value, slug: item.label }))
          )
        }}
        autoFocus={autoFocus}
      />
    </FieldContainer>
  )
}

export const Cell: CellComponent<typeof controller> = ({ item, field }) => {
  const value = item[field.path] ?? []
  const list = useList(field.refListKey)
  const { colors, spacing } = useTheme()

  return (
    <CellContainer>
      {value.map((post: { id: string; slug: string }) => (
        <Fragment key={post.id}>
          <Link
            style={{
              color: colors.foreground,
              display: 'block',
              padding: spacing.xxsmall,
              textDecoration: 'none',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.textDecoration = 'underline'
              e.currentTarget.style.color = colors.linkHoverColor
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.textDecoration = 'none'
              e.currentTarget.style.color = colors.foreground
            }}
            href={`/${list.path}/${post.id}`}
          >
            {post.slug}
          </Link>
        </Fragment>
      ))}
    </CellContainer>
  )
}

Cell.supportsLinkTo = true

export const controller = (config: FieldControllerConfig) => ({
  path: config.path,
  label: config.label,
  graphqlSelection: config.path,
  defaultValue: [],
  description: config.description || '',
  deserialize: (data: Record<string, unknown>) =>
    Array.isArray(data[config.path]) ? data[config.path] : [],
  serialize: (value: RelatedPostsQueryData['posts']) => ({
    [config.path]: value,
  }),
  refListKey: config.listKey,
})
