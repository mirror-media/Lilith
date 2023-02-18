import React, { useState } from 'react'
import styled from 'styled-components'
import { ContentBlock, ContentState } from 'draft-js'
import draftConverter from '../../../../draft-js/editor/draft-converter'
import {
  BGVideoInput,
  RenderBasicEditor,
} from '../../../../draft-js/buttons/background-video'
import { MirrorMedia } from '@mirrormedia/lilith-draft-renderer'

const { BGVideoBlock } = MirrorMedia.blockRenderer

const BGVideoRenderButton = styled.span`
  cursor: pointer;
  background-color: white;
  padding: 6px;
  border-radius: 6px;
`

type BGVideoBlockProps = {
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

export function BGVideoEditorBlock(props: BGVideoBlockProps) {
  const [toShowInput, setToShowInput] = useState(false)
  const { block, blockProps, contentState } = props
  const { onEditStart, onEditFinish, renderBasicEditor } = blockProps
  const entityKey = block.getEntityAt(0)
  const entity = contentState.getEntity(entityKey)
  const { textBlockAlign, video, rawContentState } = entity.getData()
  const onChange = ({
    textBlockAlign: newTextBlockAlign,
    video: newVideo,
    rawContentState: newRawContentState,
  }) => {
    // close `BGVideoInput`
    setToShowInput(false)
    onEditFinish({
      entityKey,
      entityData: {
        textBlockAlign: newTextBlockAlign,
        video: newVideo,
        body: draftConverter.convertToHtml(newRawContentState),
        rawContentState: newRawContentState,
      },
    })
  }

  return (
    <React.Fragment>
      <BGVideoInput
        renderBasicEditor={renderBasicEditor}
        textBlockAlign={textBlockAlign}
        video={video}
        rawContentStateForBGVideoEditor={rawContentState}
        onChange={onChange}
        onCancel={() => {
          onEditFinish({})
          setToShowInput(false)
        }}
        isOpen={toShowInput}
      />
      <div>
        <BGVideoBlock {...props} />
        <div>
          <BGVideoRenderButton
            onClick={() => {
              // call `onEditStart` prop as we are trying to update the BGVideo entity
              onEditStart()
              // open `BGVideoInput`
              setToShowInput(true)
            }}
          >
            <i className="fa-solid fa-pen"></i>
            <span>Modify</span>
          </BGVideoRenderButton>
        </div>
      </div>
    </React.Fragment>
  )
}
