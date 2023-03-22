import React from 'react'
import styled from 'styled-components'

const LinkWrapper = styled.a`
  display: inline;
  border-bottom: 2px solid #ebf02c;
  letter-spacing: 0.01em;
  text-align: justify;
  color: rgba(0, 9, 40, 0.87);
  padding-bottom: 2px;

  &:hover {
    border-bottom: 2px solid #04295e;
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
    <LinkWrapper href={url} target="_blank">
      {props.children}
    </LinkWrapper>
  )
}
