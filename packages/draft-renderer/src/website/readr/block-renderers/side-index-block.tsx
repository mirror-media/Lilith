import { ContentBlock, ContentState } from 'draft-js'
import React from 'react'
import styled from 'styled-components'

import { defaultH2Style } from '../shared-style'

const sideIndexDefaultSpacing = 32

const SideIndexBlockWrapper = styled.div`
  margin-top: ${sideIndexDefaultSpacing}px;

  h2 {
    ${defaultH2Style}
  }
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
      entityDaZta?: Record<string, unknown>
    }) => void
  }
  contentState: ContentState
}

export function SideIndexBlock(props: SideIndexBlockProps) {
  const { block, contentState } = props
  const entityKey = block.getEntityAt(0)
  const entity = contentState.getEntity(entityKey)
  const { h2Text, sideIndexText } = entity.getData()

  const sideIndexTitle = sideIndexText || h2Text || ''

  const key = sideIndexTitle.replace(/\s+/g, '')

  let sideIndexBlock

  if (h2Text) {
    sideIndexBlock = (
      <SideIndexBlockWrapper id={`header-${key}`}>
        <h2>{h2Text}</h2>
      </SideIndexBlockWrapper>
    )
  } else {
    sideIndexBlock = null
  }

  return <>{sideIndexBlock}</>
}
