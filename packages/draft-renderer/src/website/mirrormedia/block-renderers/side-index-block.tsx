import React from 'react'
import { ContentBlock, ContentState } from 'draft-js'
import styled from 'styled-components'

const SideIndexBlockWrapper = styled.div`
  display: flex;
  align-items: center;
`

const SideIndex = styled.span`
  font-size: 16px;
  margin-left: 20px;
`

type SideIndexBlockProps = {
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

export function SideIndexBlock(props: SideIndexBlockProps) {
  const { block, contentState } = props
  const entityKey = block.getEntityAt(0)
  const entity = contentState.getEntity(entityKey)
  const { h2Text, sideIndexText, sideIndexUrl } = entity.getData()

  let sideIndexBlock
  if (sideIndexUrl) {
    sideIndexBlock = (
      <a href={sideIndexUrl}>
        <SideIndex>側欄： {sideIndexText ? sideIndexText : h2Text}</SideIndex>
      </a>
    )
  } else {
    sideIndexBlock = (
      <h2>
        {h2Text}
        <SideIndex>側欄： {sideIndexText ? sideIndexText : h2Text}</SideIndex>
      </h2>
    )
  }

  return <SideIndexBlockWrapper>{sideIndexBlock}</SideIndexBlockWrapper>
}
