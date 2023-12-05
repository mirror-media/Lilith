import React from 'react'
import styled from 'styled-components'
import { ContentBlock, ContentState } from 'draft-js'
import { convertEmbeddedToAmp } from '../utils'

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

export function BGImageBlock(props: BGImageBlockProps, contentLayout: string) {
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
        <BGImageRenderBody
          dangerouslySetInnerHTML={{
            __html: contentLayout === 'amp' ? convertEmbeddedToAmp(body) : body,
          }}
        />
      </BGImageRenderWrapper>
    </React.Fragment>
  )
}
