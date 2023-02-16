import React, { useState } from 'react'
import { ContentBlock, ContentState } from 'draft-js'
import styled from 'styled-components'
import {
  SideIndexInputOnChange,
  SideIndexInput,
} from '../../../../draft-js/buttons/side-index'
import { MirrorMedia } from '@mirrormedia/lilith-draft-renderer'

const { SideIndexBlock } = MirrorMedia.blockRenderer

const SideIndexBlockButton = styled.div`
  cursor: pointer;
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

export function SideIndexEditorBlock(props: SideIndexBlockProps) {
  const [toShowInput, setToShowInput] = useState(false)
  const { block, blockProps, contentState } = props
  const { onEditStart, onEditFinish } = blockProps
  const entityKey = block.getEntityAt(0)
  const entity = contentState.getEntity(entityKey)
  const {
    h2Text,
    sideIndexText,
    sideIndexUrl,
    sideIndexImage,
  } = entity.getData()
  const onChange: SideIndexInputOnChange = ({
    h2Text,
    sideIndexText,
    sideIndexUrl,
    sideIndexImage,
  }) => {
    // close `SideIndexInput`
    setToShowInput(false)
    onEditFinish({
      entityKey,
      entityData: {
        h2Text,
        sideIndexText,
        sideIndexUrl,
        sideIndexImage,
      },
    })
  }

  return (
    <React.Fragment>
      <SideIndexInput
        h2Text={h2Text}
        sideIndexText={sideIndexText}
        sideIndexUrl={sideIndexUrl}
        sideIndexImage={sideIndexImage}
        onChange={onChange}
        onCancel={() => {
          onEditFinish({})
          setToShowInput(false)
        }}
        isOpen={toShowInput}
      />
      <div>
        <SideIndexBlock {...props} />
        <SideIndexBlockButton
          onClick={() => {
            // call `onEditStart` prop as we are trying to update the SideIndex entity
            onEditStart()
            // open `SideIndexInput`
            setToShowInput(true)
          }}
        >
          <i className="fa-solid fa-pen"></i>
          <span>Modify</span>
        </SideIndexBlockButton>
      </div>
    </React.Fragment>
  )
}
