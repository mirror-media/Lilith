import React from 'react'
import { ContentBlock, ContentState } from 'draft-js'
import styled from 'styled-components'

const InfoBoxRenderWrapper = styled.div`
  background-color: #f5f4f3;
  padding: 30px;
  position: relative;
`

type InfoBoxBlockProps = {
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

export function InfoBoxBlock(props: InfoBoxBlockProps) {
  const { block, contentState } = props
  const entityKey = block.getEntityAt(0)
  const entity = contentState.getEntity(entityKey)
  const { title, body } = entity.getData()

  return (
    <InfoBoxRenderWrapper>
      <h2>{title}</h2>
      <div dangerouslySetInnerHTML={{ __html: body }} />
    </InfoBoxRenderWrapper>
  )
}
