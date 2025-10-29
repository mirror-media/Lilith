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
import { gql, useQuery } from '@keystone-6/core/admin-ui/apollo'

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
import { useEffect, useRef } from 'react'

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
  const isAssignedRef = useRef(false)

  const writersFieldValue = createItem.props.value.writers?.value
  const writersIds = writersFieldValue?.value
    ? writersFieldValue.value.map((w: { id: string }) => w.id)
    : []

  const { data } = useQuery(
    gql`
      query GetContactSections($contactIds: [ID!]!) {
        contacts(where: { id: { in: $contactIds } }) {
          id
          sections {
            id
            name
          }
        }
      }
    `,
    {
      variables: {
        contactIds: writersIds,
      },
      skip: writersIds.length === 0,
    }
  )

  useEffect(() => {
    if (data?.contacts && !isAssignedRef.current) {
      const sections: any[] = []
      const idSet = new Set()

      data.contacts.forEach((contact: any) => {
        contact.sections?.forEach((section: { id: string; name: string }) => {
          if (!idSet.has(section.id)) {
            idSet.add(section.id)
            sections.push({
              id: section.id,
              label: section.name,
            })
          }
        })
      })

      const currentValue = createItem.props.value.sections?.value

      if (typeof createItem.props.onChange === 'function') {
        const existingSections = currentValue?.value || []
        const existingIdSet = new Set(existingSections.map((s: any) => s.id))

        const mergedSections = [...existingSections]
        sections.forEach((section) => {
          if (!existingIdSet.has(section.id)) {
            mergedSections.push(section)
          }
        })

        if (mergedSections.length > 0) {
          const update = Object.assign({}, currentValue, {
            value: mergedSections,
          })

          createItem.props.onChange((oldValue: any) => ({
            ...oldValue,
            sections: {
              kind: 'value',
              value: update,
            },
          }))
          isAssignedRef.current = true
        }
      }
    }
  }, [data, createItem.props])

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
