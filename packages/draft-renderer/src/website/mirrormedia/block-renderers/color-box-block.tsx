import React from 'react'
import styled from 'styled-components'
import { ContentBlock, ContentState } from 'draft-js'
import { convertEmbeddedToAmp } from '../utils'

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

export function ColorBoxBlock(
  colorBoxBlockProps: ColorBoxBlockProps,
  contentLayout: string
) {
  const { block, contentState } = colorBoxBlockProps
  const entityKey = block.getEntityAt(0)
  const entity = contentState.getEntity(entityKey)
  const { color, body } = entity.getData()

  return (
    <ColorBoxRenderWrapper color={color}>
      <div
        dangerouslySetInnerHTML={{
          __html: contentLayout === 'amp' ? convertEmbeddedToAmp(body) : body,
        }}
      />
    </ColorBoxRenderWrapper>
  )
}
