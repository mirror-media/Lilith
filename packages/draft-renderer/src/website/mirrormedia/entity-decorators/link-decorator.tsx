import React from 'react'
import styled from 'styled-components'

const LinkWrapper = styled.a`
  color: #054f77;
  text-decoration: underline;
  &:active {
    color: rgba(157, 157, 157, 1);
  }
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

export const linkDecorator = {
  strategy: findLinkEntities,
  component: Link,
}

function Link(props) {
  const { url } = props.contentState.getEntity(props.entityKey).getData()
  return (
    <LinkWrapper href={url} target="_blank" rel="noreferrer noopenner">
      {props.children}
    </LinkWrapper>
  )
}
