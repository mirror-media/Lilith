import React, { useState } from 'react'
import styled from 'styled-components'
import { ContentBlock, ContentState } from 'draft-js'
import draftConverter from '../../../draft-js/draft-converter'
import {
  BGImageInput,
  RenderBasicEditor,
} from '../../../draft-js/buttons/background-image'
import MirrorMedia from '@mirrormedia/lilith-draft-renderer/lib/website/mirrormedia'

const { BGImageBlock } = MirrorMedia.blockRenderers

const BGImageRenderButton = styled.span`
  cursor: pointer;
  background-color: white;
  padding: 6px;
  border-radius: 6px;
`

type BGImageBlockProps = {
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

export function BGImageEditorBlock(props: BGImageBlockProps) {
  const [toShowInput, setToShowInput] = useState(false)
  const { block, blockProps, contentState } = props
  const { onEditStart, onEditFinish, renderBasicEditor } = blockProps
  const entityKey = block.getEntityAt(0)
  const entity = contentState.getEntity(entityKey)
  const { textBlockAlign, image, rawContentState } = entity.getData()
  const onChange = ({
    textBlockAlign: newTextBlockAlign,
    image: newImage,
    rawContentState: newRawContentState,
  }) => {
    // close `BGImageInput`
    setToShowInput(false)
    onEditFinish({
      entityKey,
      entityData: {
        textBlockAlign: newTextBlockAlign,
        image: newImage,
        body: draftConverter.convertToHtml(newRawContentState),
        rawContentState: newRawContentState,
      },
    })
  }

  return (
    <React.Fragment>
      <BGImageInput
        renderBasicEditor={renderBasicEditor}
        textBlockAlign={textBlockAlign}
        image={image}
        rawContentStateForBGImageEditor={rawContentState}
        onChange={onChange}
        onCancel={() => {
          onEditFinish({})
          setToShowInput(false)
        }}
        isOpen={toShowInput}
      />
      <div>
        <BGImageBlock {...props} />
        <div>
          <BGImageRenderButton
            onClick={() => {
              // call `onEditStart` prop as we are trying to update the BGImage entity
              onEditStart()
              // open `BGImageInput`
              setToShowInput(true)
            }}
          >
            <i className="fa-solid fa-pen"></i>
            <span>Modify</span>
          </BGImageRenderButton>
        </div>
      </div>
    </React.Fragment>
  )
}
