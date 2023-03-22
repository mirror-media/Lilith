import React, { useState } from 'react'
import { ContentBlock, ContentState, RawDraftContentState } from 'draft-js'
import styled from 'styled-components'
import draftConverter from '../../../draft-js/draft-converter'
import {
  InfoBoxInput,
  RenderBasicEditor,
} from '../../../draft-js/buttons/info-box'
import Readr from '@mirrormedia/lilith-draft-renderer/lib/website/readr'

const { InfoBoxBlock } = Readr.blockRenderers

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
    renderBasicEditor: RenderBasicEditor
  }
  contentState: ContentState
}

export function InfoBoxEditorBlock(props: InfoBoxBlockProps) {
  const [toShowInput, setToShowInput] = useState(false)
  const { block, blockProps, contentState } = props
  const { onEditStart, onEditFinish, renderBasicEditor } = blockProps
  const entityKey = block.getEntityAt(0)
  const entity = contentState.getEntity(entityKey)
  const { title, rawContentState } = entity.getData()
  const onChange = ({
    title: newTitle,
    rawContentState: newRawContentState,
  }: {
    title: string
    rawContentState: RawDraftContentState
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
        renderBasicEditor={renderBasicEditor}
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
