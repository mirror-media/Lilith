import React from 'react'
import styled, { css } from 'styled-components'

const linkStyleNormal = css`
  color: #054f77;
`
const linkStylePhotography = css`
  color: #61b8c6;
`

const LinkWrapper = styled.a`
  text-decoration: underline;
  text-underline-offset: 2px;
  &:active {
    color: rgba(157, 157, 157, 1);
  }
  ${({ contentLayout }) => {
    switch (contentLayout) {
      case 'normal':
        return linkStyleNormal
      case 'photography':
        return linkStylePhotography
      default:
        return linkStyleNormal
    }
  }}
`

function findLinkEntities(contentBlock, callback, contentState) {
  contentBlock.findEntityRanges((character) => {
    const entityKey = character.getEntity()
    return (
      entityKey !== null &&
      contentState.getEntity(entityKey).getType() === 'LINK'
    )
  }, callback)
}

export const linkDecorator = (contentLayout = 'normal') => {
  return {
    strategy: findLinkEntities,
    component: Link,
    props: { contentLayout },
  }
}

function Link(props) {
  const { url } = props.contentState.getEntity(props.entityKey).getData()
  const { contentLayout = 'normal' } = props
  return (
    <LinkWrapper
      href={url}
      target="_blank"
      rel="noreferrer noopenner"
      contentLayout={contentLayout}
    >
      {props.children}
    </LinkWrapper>
  )
}
