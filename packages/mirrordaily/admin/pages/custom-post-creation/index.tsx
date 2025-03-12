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
  'slug',
  'title',
  'state',
  'publishedDate',
  'sections',
  'writers',
  'heroVideo',
  'content',
]

function CreatePageForm(props: { list: ListMeta }) {
  const createItem = useCreateItem(props.list)
  const router = useRouter()
  // use Ref to prevent infinite re-render
  const isAssignedRef = useRef(false)
  const { data } = useQuery(
    gql`
      query GetSection($where: SectionWhereInput! = {}) {
        sections(where: $where) {
          id
          name
        }
      }
    `,
    {
      variables: { where: { name: { equals: '即時' } } },
    }
  )

  if (
    isAssignedRef.current === false &&
    data &&
    Array.isArray(data.sections) &&
    data.sections.length > 0
  ) {
    const section = data.sections[0]

    // set `即時` section as default
    createItem.props.onChange(() => {
      return Object.assign({}, createItem.props.value, {
        sections: {
          ...createItem.props.value.sections,
          value: {
            // @ts-ignore: .value exists
            ...createItem.props.value.sections.value,
            value: [
              {
                id: section.id,
                label: section.name,
                data: {
                  __typename: 'Section',
                },
              },
            ],
          },
        },
      })
    })
    isAssignedRef.current = true
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
