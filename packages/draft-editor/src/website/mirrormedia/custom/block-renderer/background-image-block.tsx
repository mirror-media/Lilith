import React, { useState } from 'react'
import styled from 'styled-components'
import { ContentBlock, ContentState } from 'draft-js'
import draftConverter from '../../../../draft-js/editor/draft-converter'
// import { BGImageInput } from '../../../../draft-js/buttons/background-image'

const BGImageRenderWrapper = styled.div`
  padding: 30px;
  position: relative;
  width: 100%;
  height: 100%;
  background-image: url(${({ image }) => image});
  background-size: cover;
  background-position: center center;
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

const BGImageRenderBody = styled.div`
  background: rgba(0, 0, 0, 0.5);
  padding: 4px 20px;
  margin-bottom: 10px;
`

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
  }
  contentState: ContentState
}

export function BGImageBlock(props: BGImageBlockProps) {
  const { block, contentState } = props
  const entityKey = block.getEntityAt(0)
  const entity = contentState.getEntity(entityKey)
  const { textBlockAlign, image, body } = entity.getData()

  return (
    <React.Fragment>
      <BGImageRenderWrapper
        image={image?.imageFile?.url}
        textBlockAlign={textBlockAlign}
      >
        <BGImageRenderBody dangerouslySetInnerHTML={{ __html: body }} />
      </BGImageRenderWrapper>
    </React.Fragment>
  )
}

export function BGImageEditorBlock(props: BGImageBlockProps) {
  const [toShowInput, setToShowInput] = useState(false)
  const { block, blockProps, contentState } = props
  const { onEditStart, onEditFinish } = blockProps
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
