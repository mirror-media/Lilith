import React from 'react'
import styled from 'styled-components'
import { ContentBlock, ContentState } from 'draft-js'
import { convertEmbeddedToAmp } from '../utils'

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

export function BGVideoBlock(props: BGVideoBlockProps, contentLayout: string) {
  const { block, contentState } = props
  const entityKey = block.getEntityAt(0)
  const entity = contentState.getEntity(entityKey)
  const { textBlockAlign, video, body } = entity.getData()

  return (
    <React.Fragment>
      <BGVideoRenderWrapper textBlockAlign={textBlockAlign}>
        <BGVideoRednerVideo muted autoPlay loop>
          <source src={video?.urlOriginal} />
          <source src={video?.file?.url} />
        </BGVideoRednerVideo>
        <BGVideoRenderBody
          dangerouslySetInnerHTML={{
            __html: contentLayout === 'amp' ? convertEmbeddedToAmp(body) : body,
          }}
        />
      </BGVideoRenderWrapper>
    </React.Fragment>
  )
}
