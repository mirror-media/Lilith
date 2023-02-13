import React, { useState } from 'react'
import { ContentBlock, ContentState } from 'draft-js'
import styled from 'styled-components'
import draftConverter from '../../../../draft-js/editor/draft-converter'
import { InfoBoxInput } from '../../../../draft-js/buttons/info-box'

const InfoBoxRenderWrapper = styled.div`
  background-color: #f5f4f3;
  padding: 30px;
  position: relative;
`

const InfoBoxRenderButton = styled.div`
  cursor: pointer;
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
      <div dangerouslySetInnerHTML={{ __html: body }} />
    </InfoBoxRenderWrapper>
  )
}

export function InfoBoxEditorBlock(props: InfoBoxBlockProps) {
  const [toShowInput, setToShowInput] = useState(false)
  const { block, blockProps, contentState } = props
  const { onEditStart, onEditFinish } = blockProps
  const entityKey = block.getEntityAt(0)
  const entity = contentState.getEntity(entityKey)
  const { title, rawContentState } = entity.getData()
  const onChange = ({
    title: newTitle,
    rawContentState: newRawContentState,
  }) => {
    // close `InfoBoxInput`
    setToShowInput(false)

    onEditFinish({
      entityKey,
      entityData: {
        title: newTitle,
        body: draftConverter.convertToHtml(newRawContentState),
        rawContentState: newRawContentState,
      },
    })
  }

  return (
    <React.Fragment>
      <InfoBoxInput
        title={title}
        rawContentStateForInfoBoxEditor={rawContentState}
        onChange={onChange}
        onCancel={() => {
          onEditFinish({})
          setToShowInput(false)
        }}
        isOpen={toShowInput}
      />
      <div>
        <InfoBoxBlock {...props} />
        <InfoBoxRenderButton
          onClick={() => {
            // call `onEditStart` prop as we are trying to update the InfoBox entity
            onEditStart()
            // open `InfoBoxInput`
            setToShowInput(true)
          }}
        >
          <i className="fa-solid fa-pen"></i>
          <span>Modify</span>
        </InfoBoxRenderButton>
      </div>
    </React.Fragment>
  )
}
