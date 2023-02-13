import React, { useState } from 'react'
import styled from 'styled-components'
import { ContentBlock, ContentState } from 'draft-js'
import draftConverter from '../../../../draft-js/editor/draft-converter'
import { ColorBoxInput } from '../../../../draft-js/buttons/color-box'

const ColorBoxRenderWrapper = styled.div`
  background-color: ${(props) => (props.color ? props.color : '#F5F4F3')};
  padding: 30px;
  position: relative;
  color: white;
`

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
  }
  contentState: ContentState
}

export function ColorBoxBlock(props: ColorBoxBlockProps) {
  const { block, contentState } = props
  const entityKey = block.getEntityAt(0)
  const entity = contentState.getEntity(entityKey)
  const { color, body } = entity.getData()

  return (
    <ColorBoxRenderWrapper color={color}>
      <div dangerouslySetInnerHTML={{ __html: body }} />
    </ColorBoxRenderWrapper>
  )
}

export function ColorBoxEditorBlock(props: ColorBoxBlockProps) {
  const [toShowInput, setToShowInput] = useState(false)
  const { block, blockProps, contentState } = props
  const { onEditStart, onEditFinish } = blockProps
  const entityKey = block.getEntityAt(0)
  const entity = contentState.getEntity(entityKey)
  const { color, rawContentState } = entity.getData()
  const onChange = ({
    color: newColor,
    rawContentState: newRawContentState,
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
