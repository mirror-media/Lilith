import React from 'react'
import styled from 'styled-components'
import { ContentBlock, ContentState } from 'draft-js'

const ColorBoxRenderWrapper = styled.div`
  background-color: ${(props) => (props.color ? props.color : '#F5F4F3')};
  padding: 30px;
  position: relative;
  color: white;
`

type ColorBoxBlockProps = {
  block: ContentBlock
  blockProps: {
    onEditStart: () => void
    onEditFinish: ({
      entityKey,
      entityData,
    }: {
      entityKey?: string
      entityData?: Record<string, unknown>
    }) => void
  }
  contentState: ContentState
}

export function ColorBoxBlock(props: ColorBoxBlockProps) {
  const { block, contentState } = props
  const entityKey = block.getEntityAt(0)
  const entity = contentState.getEntity(entityKey)
  const { color, body } = entity.getData()

  return (
    <ColorBoxRenderWrapper color={color}>
      <div dangerouslySetInnerHTML={{ __html: body }} />
    </ColorBoxRenderWrapper>
  )
}
