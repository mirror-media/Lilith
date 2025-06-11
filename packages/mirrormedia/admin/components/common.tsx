/** Copy from @keyston-6/core@5.2.0:packages\core\src\___internal-do-not-use-will-break-in-patch\admin-ui\pages\ItemPage\common.tsx */

import type { ComponentPropsWithoutRef, HTMLAttributes, ReactNode } from 'react'
import type { ListMeta } from '@keystone-6/core/types'
import { Heading, useTheme } from '@keystone-ui/core'
import { ChevronRightIcon } from '@keystone-ui/icons/icons/ChevronRightIcon'
import { Fragment } from 'react'
import { Link } from '@keystone-ui/core'

type ContainerProps = ComponentPropsWithoutRef<'div'>
export const Container = ({ children, ...props }: ContainerProps) => (
  <div
    style={{
      minWidth: 0, // fix flex text truncation
      maxWidth: 1080,
      // marginLeft: 'auto',
      // marginRight: 'auto',
    }}
    {...props}
  >
    {children}
  </div>
)

export function ItemPageHeader(props: { list: ListMeta; label: string }) {
  const { palette, spacing } = useTheme()

  return (
    <Container
      style={{
        alignItems: 'center',
        display: 'flex',
        flex: 1,
        justifyContent: 'space-between',
      }}
    >
      <div
        style={{
          alignItems: 'center',
          display: 'flex',
          flex: 1,
          minWidth: 0,
        }}
      >
        {props.list.isSingleton ? (
          <Heading type="h3">{props.list.label}</Heading>
        ) : (
          <Fragment>
            <Heading type="h3">
              <Link
                href={`/${props.list.path}`}
                style={{ textDecoration: 'none' }}
              >
                {props.list.label}
              </Link>
            </Heading>
            <div
              style={{
                color: palette.neutral500,
                marginLeft: spacing.xsmall,
                marginRight: spacing.xsmall,
              }}
            >
              <ChevronRightIcon />
            </div>
            <Heading
              as="h1"
              type="h3"
              style={{
                minWidth: 0,
                maxWidth: '100%',
                overflow: 'hidden',
                flex: 1,
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {props.label}
            </Heading>
          </Fragment>
        )}
      </div>
    </Container>
  )
}

export function ColumnLayout(props: HTMLAttributes<HTMLDivElement>) {
  const { spacing } = useTheme()

  return (
    // this container must be relative to catch absolute children
    // particularly the "expanded" document-field, which needs a height of 100%
    <Container style={{ position: 'relative', height: '100%' }}>
      <div
        style={{
          alignItems: 'start',
          display: 'grid',
          gap: spacing.xlarge,
          gridTemplateColumns: `2fr 1fr`,
        }}
        {...props}
      />
    </Container>
  )
}

export function BaseToolbar(props: { children: ReactNode }) {
  const { colors, spacing } = useTheme()

  return (
    <div
      style={{
        background: colors.background,
        bottom: 0,
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: spacing.xlarge,
        paddingBottom: spacing.small,
        position: 'fixed',
        zIndex: 20,
      }}
    >
      {props.children}
    </div>
  )
}
