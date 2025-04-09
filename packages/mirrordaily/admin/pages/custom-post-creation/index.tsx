/** Reference: @keystone-6/core@5.2.0:packages\core\src\___internal-do-not-use-will-break-in-patch\admin-ui\pages\CreateItemPage\index.tsx */

import type { ListMeta } from '@keystone-6/core/types'
import { pick } from 'lodash-es'
import { useList, useKeystone } from '@keystone-6/core/admin-ui/context'
import {
  PageContainer,
  GraphQLErrorNotice,
} from '@keystone-6/core/admin-ui/components'
import { Fields } from '@keystone-6/core/admin-ui/utils'
import { useRouter } from '@keystone-6/core/admin-ui/router'

import { Box } from '@keystone-ui/core'
import { LoadingDots } from '@keystone-ui/loading'
import { Button } from '@keystone-ui/button'
import {
  ColumnLayout,
  ItemPageHeader,
  BaseToolbar,
} from '../../components/common'
import { useCreateItem } from '../../utils/use-create-item'
import { useRef } from 'react'
import { gql, useQuery } from '@keystone-6/core/admin-ui/apollo'

const LIST_KEY = 'Post'
const PICKED_FIELDS = [
  'id',
  'title',
  'state',
  'publishedDate',
  'sections',
  'writers',
  'content',
  'heroImage',
  'heroCaption',
  'relateds',
]

type Section = {
  id: string
  name: string
}

function CreatePageForm(props: { list: ListMeta }) {
  const { authenticatedItem } = useKeystone()
  const createItem = useCreateItem(props.list)
  const router = useRouter()
  // use Ref to prevent infinite re-render
  const isAssignedRef = useRef(false)
  const { data } = useQuery(
    gql`
      query GetAuthorAndSections(
        $where: SectionWhereInput! = {}
        $userId: ID!
      ) {
        sections(where: $where) {
          id
          name
        }
        user(where: { id: $userId }) {
          author {
            id
            name
            sections {
              id
              name
            }
          }
        }
      }
    `,
    {
      variables: {
        where: { name: { equals: '即時' } },
        // @ts-ignore: authenticatedItem.id exists
        userId: authenticatedItem.id,
      },
    }
  )

  if (isAssignedRef.current === false && data) {
    const sections: any[] = []
    const idSet = new Set()

    const iteratorFn = (item: Section) => {
      const id = item.id

      if (!idSet.has(id)) {
        idSet.add(id)

        sections.push({
          id: item.id,
          label: item.name,
          data: {
            __typename: 'Section',
          },
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

    let shouldChange = false
    const update = Object.assign({}, createItem.props.value)

    if (sections.length > 0) {
      Object.assign(update, {
        sections: {
          ...update.sections,
          value: {
            // @ts-ignore: .value exists
            ...update.sections.value,
            value: sections,
          },
        },
      })

      shouldChange = true
    }

    if (data.user?.author) {
      const item = data.user.author

      Object.assign(update, {
        writers: {
          ...update.writers,
          value: {
            // @ts-ignore: .value exists
            ...update.writers.value,
            value: [
              {
                id: item.id,
                label: item.name,
                data: {
                  __typename: 'Contact',
                },
              },
            ],
          },
        },
      })

      shouldChange = true
    }

    if (shouldChange) {
      createItem.props.onChange(() => {
        return update
      })
      isAssignedRef.current = true
    }
  }

  return (
    <Box paddingTop="xlarge">
      {createItem.error && (
        <GraphQLErrorNotice
          networkError={createItem.error?.networkError}
          errors={createItem.error?.graphQLErrors}
        />
      )}

      <Fields {...createItem.props} />
      <BaseToolbar>
        <Button
          isLoading={createItem.state === 'loading'}
          weight="bold"
          tone="active"
          onClick={async () => {
            const item = await createItem.create()
            if (item) {
              router.push(`/${props.list.path}/${item.id}`)
            }
          }}
        >
          Create {props.list.singular}
        </Button>
      </BaseToolbar>
    </Box>
  )
}

export default function CustomPostCreation() {
  const list = useList(LIST_KEY)
  const { createViewFieldModes } = useKeystone()

  const newList = Object.assign({}, list, {
    fields: pick(list.fields, PICKED_FIELDS),
  })

  return (
    <PageContainer
      title="Custom Post Creation"
      header={<ItemPageHeader list={newList} label="Create" />}
    >
      <ColumnLayout>
        <Box>
          {createViewFieldModes.state === 'error' && (
            <GraphQLErrorNotice
              networkError={
                createViewFieldModes.error instanceof Error
                  ? createViewFieldModes.error
                  : undefined
              }
              errors={
                createViewFieldModes.error instanceof Error
                  ? undefined
                  : createViewFieldModes.error
              }
            />
          )}
          {createViewFieldModes.state === 'loading' && (
            <LoadingDots label="Loading create form" />
          )}
          <CreatePageForm list={newList} />
        </Box>
      </ColumnLayout>
    </PageContainer>
  )
}
