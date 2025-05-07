/** @jsxRuntime classic */
/** @jsx jsx */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { jsx } from '@keystone-ui/core'
import { useEffect, useState, Fragment } from 'react'
import { FieldContainer, FieldLabel, MultiSelect } from '@keystone-ui/fields'
import type {
  FieldProps,
  FieldControllerConfig,
  CellComponent,
} from '@keystone-6/core/types'
import { useList } from '@keystone-6/core/admin-ui/context'
import { Link, useRouter } from '@keystone-6/core/admin-ui/router'
import { CellContainer } from '@keystone-6/core/admin-ui/components'
import { useQuery, gql } from '@keystone-6/core/admin-ui/apollo'
import { useTheme } from '@keystone-ui/core'

const RELATED_POSTS_QUERY = gql`
  query RelatedPosts($id: ID!) {
    post(where: { id: $id }) {
      id
      slug
      related_posts {
        id
        slug
        title
      }
    }
  }
`

type RelatedPostsQueryData = {
  post: {
    id: string
    slug: string
    related_posts: {
      id: string
      slug: string
      title: string
    }[]
  }
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
  const [options, setOptions] = useState<Selection[]>([])
  const [rawData, setRawData] = useState<
    RelatedPostsQueryData['post']['related_posts']
  >([])
  const router = useRouter()
  const { id } = router.query
  const { data, error, loading } = useQuery<RelatedPostsQueryData>(
    RELATED_POSTS_QUERY,
    {
      variables: { id },
      fetchPolicy: 'cache-and-network',
      skip: !id,
    }
  )

  useEffect(() => {
    if (data?.post) {
      const formatted = data.post.related_posts.map(({ id, slug }) => ({
        label: slug,
        value: id,
      }))
      setOptions(formatted)
      setRawData(data.post.related_posts)
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
        value={(
          (value as RelatedPostsQueryData['post']['related_posts']) || []
        ).map((post) => ({
          label: post.slug,
          value: post.id,
        }))}
        onChange={(newValue) => {
          onChange?.(
            newValue.map((item) => rawData.find((r) => r.id === item.value))
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
  serialize: (value: RelatedPostsQueryData['post']['related_posts']) => ({
    [config.path]: value,
  }),
  refListKey: config.listKey,
})
