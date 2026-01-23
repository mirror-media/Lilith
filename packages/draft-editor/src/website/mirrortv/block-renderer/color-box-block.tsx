import React, { useState } from 'react'
import styled from 'styled-components'
import { ContentBlock, ContentState, RawDraftContentState } from 'draft-js'
import draftConverter from '../../../draft-js/draft-converter'
import {
  ColorBoxInput,
  RenderBasicEditor,
} from '../../../draft-js/buttons/color-box'
import MirrorMedia from '@mirrormedia/lilith-draft-renderer/lib/website/mirrormedia'

const { ColorBoxBlock } = MirrorMedia.blockRenderers

const ColorBoxRenderButton = styled.div`
  cursor: pointer;
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
    renderBasicEditor: RenderBasicEditor
  }
  contentState: ContentState
}

export function ColorBoxEditorBlock(props: ColorBoxBlockProps) {
  const [toShowInput, setToShowInput] = useState(false)
  const { block, blockProps, contentState } = props
  const { onEditStart, onEditFinish, renderBasicEditor } = blockProps
  const entityKey = block.getEntityAt(0)
  const entity = contentState.getEntity(entityKey)
  const { color, rawContentState } = entity.getData()
  const onChange = ({
    color: newColor,
    rawContentState: newRawContentState,
  }: {
    color: string
    rawContentState: RawDraftContentState
  }) => {
    // close `ColorBoxInput`
    setToShowInput(false)

    onEditFinish({
      entityKey,
      entityData: {
        color: newColor,
        body: draftConverter.convertToHtml(newRawContentState),
        rawContentState: newRawContentState,
      },
    })
  }

  return (
    <React.Fragment>
      <ColorBoxInput
        renderBasicEditor={renderBasicEditor}
        color={color}
        rawContentStateForColorBoxEditor={rawContentState}
        onChange={onChange}
        onCancel={() => {
          onEditFinish({})
          setToShowInput(false)
        }}
        isOpen={toShowInput}
      />
      <div>
        <ColorBoxBlock {...props} />
        <ColorBoxRenderButton
          onClick={() => {
            // call `onEditStart` prop as we are trying to update the ColorBox entity
            onEditStart()
            // open `ColorBoxInput`
            setToShowInput(true)
          }}
        >
          <i className="fa-solid fa-pen"></i>
          <span>Modify</span>
        </ColorBoxRenderButton>
      </div>
    </React.Fragment>
  )
}
