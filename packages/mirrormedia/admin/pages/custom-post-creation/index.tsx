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
import { useCreateItemWithAutoSlug } from '../../utils/use-create-item'
import styled from '@emotion/styled'

const LIST_KEY = 'Post'
const PICKED_FIELDS = [
  'id',
  'slug',
  'title',
  'sections',
  'writers',
  'content',
  'heroImage',
  'heroCaption',
  'defaultHeroImage',
  'relateds',
  'state',
  'publishedDate',
]

const CUSTOM_FIELD_MODES = {
  slug: 'hidden' as const,
}

const Wrapper = styled.div`
  /* workaround: padding-bottom is added to ensure all content is visible on mobile devices */
  padding-bottom: 140px;
  max-width: 320px;

  @media (min-width: 575px) {
    max-width: none;
    padding-bottom: 0px;
  }
`

function CreatePageForm(props: { list: ListMeta }) {
  const createItem = useCreateItemWithAutoSlug(props.list, CUSTOM_FIELD_MODES)
  const router = useRouter()

  return (
    <Box paddingTop="xlarge">
      <Wrapper>
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
      </Wrapper>
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
