import React, { useState } from 'react'
import styled from 'styled-components'
import { ContentBlock, ContentState } from 'draft-js'
import draftConverter from '../../../../draft-js/editor/draft-converter'
import { BGVideoInput } from '../../../../draft-js/buttons/background-video'

const BGVideoRenderWrapper = styled.div`
  position: relative;
  padding: 30px;
  width: 100%;
  ${({ textBlockAlign }) => {
    if (textBlockAlign === 'left') {
      return `padding-right: 50%;`
    } else if (textBlockAlign === 'right') {
      return `padding-left: 50%;`
    } else if (textBlockAlign === 'bottom') {
      return `padding-top: 50%;`
    }
  }}
`

const BGVideoRednerVideo = styled.video`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: -1;
  background-color: black;
`

const BGVideoRenderBody = styled.div`
  background: rgba(0, 0, 0, 0.5);
  padding: 4px 20px;
  margin-bottom: 10px;
`

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
  }
  contentState: ContentState
}

export function BGVideoBlock(props: BGVideoBlockProps) {
  const { block, contentState } = props
  const entityKey = block.getEntityAt(0)
  const entity = contentState.getEntity(entityKey)
  const { textBlockAlign, video, body } = entity.getData()

  return (
    <React.Fragment>
      <BGVideoRenderWrapper textBlockAlign={textBlockAlign}>
        <BGVideoRednerVideo muted autoPlay loop>
          <source src={video?.url} />
          <source src={video?.file?.url} />
        </BGVideoRednerVideo>
        <BGVideoRenderBody dangerouslySetInnerHTML={{ __html: body }} />
      </BGVideoRenderWrapper>
    </React.Fragment>
  )
}

export function BGVideoEditorBlock(props: BGVideoBlockProps) {
  const [toShowInput, setToShowInput] = useState(false)
  const { block, blockProps, contentState } = props
  const { onEditStart, onEditFinish } = blockProps
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
