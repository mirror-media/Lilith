/** Copy from @keyston-6/core@5.2.0:packages\core\src\___internal-do-not-use-will-break-in-patch\admin-ui\pages\ItemPage\common.tsx */

import type { ComponentPropsWithoutRef, HTMLAttributes, ReactNode } from 'react'
import type { ListMeta } from '@keystone-6/core/types'
import { Heading, useTheme } from '@keystone-ui/core'
import { ChevronRightIcon } from '@keystone-ui/icons/icons/ChevronRightIcon'
import { Fragment, Children } from 'react'
import { Link } from '@keystone-ui/core'
import { css, jsx } from '@emotion/react'

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
  const { children, ...restProps } = props
  const childCount = Children.count(children)

  const gridStyles = css({
    alignItems: 'start',
    display: 'grid',
    gap: spacing.xlarge,
    gridTemplateColumns: childCount === 1 ? '1fr' : '2fr 1fr',
    '@media (min-width: 576px)': {
      gridTemplateColumns: '2fr 1fr',
    },
  })

  return (
    // this container must be relative to catch absolute children
    // particularly the "expanded" document-field, which needs a height of 100%
    <Container style={{ position: 'relative', height: '100%' }}>
      {jsx('div', { css: gridStyles, ...restProps, children })}
    </Container>
  )
}

export function BaseToolbar(props: { children: ReactNode }) {
  const { colors, spacing } = useTheme()

  return (
    <div
      style={{
        background: colors.background,
        display: 'flex',
        justifyContent: 'space-between',
        paddingBottom: spacing.medium,
        paddingTop: spacing.medium,
      }}
    >
      {props.children}
    </div>
  )
}
