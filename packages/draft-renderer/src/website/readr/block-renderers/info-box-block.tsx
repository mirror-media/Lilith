import React from 'react'
import { ContentBlock, ContentState } from 'draft-js'
import styled from 'styled-components'

const InfoBoxRenderWrapper = styled.div`
  background: #f6f6fb;
  position: relative;
  padding: 24px 0;
`

const InfoTitle = styled.div`
  width: 100%;
  font-style: normal;
  font-weight: 700;
  font-size: 18px;
  line-height: 150%;
  letter-spacing: 0.03em;
  color: #000928;
  border-left: 8px solid #04295e;
  padding: 0 32px 0 24px;
  margin-bottom: 8px;
`

const InfoContent = styled.div`
  padding: 0px 32px;
  font-size: 16px;
  line-height: 160%;
  color: rgba(0, 9, 40, 0.87);
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
      <InfoTitle>{title}</InfoTitle>
      <InfoContent>
        <div dangerouslySetInnerHTML={{ __html: body }} />
      </InfoContent>
    </InfoBoxRenderWrapper>
  )
}
