import React from 'react'
import { ContentBlock, ContentState } from 'draft-js'
import styled from 'styled-components'

const InfoBoxRenderWrapper = styled.div`
  background-color: #054f77;
  padding: 32px 30px 22px 30px;
  margin-top: 20px;
  margin-bottom: 20px;
  position: relative;
  color: #c4c4c4;
  > h2 {
    font-size: 20px;
    line-height: 1.5;
    color: #ffffff;
    margin-bottom: 18px;
  }
`
const infoBoxLineHeight = 1.8
const InfoBoxBody = styled.div`
  > * + * {
    margin-top: 20px;
  }
  font-size: 16px;
  line-height: ${infoBoxLineHeight};
  a {
    text-decoration: underline;
  }
  ul {
    margin-left: 18px;

    li {
      position: relative;
      &::before {
        content: '';
        position: absolute;
        top: calc((1rem * ${infoBoxLineHeight}) / 2);
        left: -12px;
        width: 6px;
        height: 6px;
        transform: translate(-50%, -50%);
        border-radius: 50%;
        background-color: #c4c4c4;
      }
    }
  }
  ol {
    margin-left: 18px;
    li {
      position: relative;
      counter-increment: list;
      padding-left: 6px;
      &::before {
        content: counter(list) '.';
        position: absolute;
        color: #c4c4c4;
        left: -15px;
        width: 15px;
      }
    }
  }
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
      <InfoBoxBody
        dangerouslySetInnerHTML={{ __html: body }}
        className="content"
      />
    </InfoBoxRenderWrapper>
  )
}
