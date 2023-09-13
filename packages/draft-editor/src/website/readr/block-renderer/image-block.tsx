import React, { useState } from 'react'
import styled from 'styled-components'
import { ContentBlock, ContentState } from 'draft-js'

import ReadrMedia from '@mirrormedia/lilith-draft-renderer/lib/website/readr'
import {
  ImageSelector,
  ImageEntityWithMeta,
  ImageEntityImageFile,
  ImageEntityResized,
  ImageSelectorOnChangeFn,
} from '../selector/image-selector'

const { ImageBlock } = ReadrMedia.blockRenderers

const StyledImageBlock = styled(ImageBlock)``

const ImageEditButton = styled.span`
  cursor: pointer;
  background-color: white;
  padding: 6px;
  border-radius: 6px;
`

type ImageBlockProps = {
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

export function ImageEditorBlock(props: ImageBlockProps) {
  const [toShowImageSelector, setToShowImageSelector] = useState(false)
  const { block, blockProps, contentState } = props
  const { onEditStart, onEditFinish } = blockProps
  const entityKey = block.getEntityAt(0)
  const entity = contentState.getEntity(entityKey)
  const {
    id,
    name,
    imageFile,
    resized,
    desc,
    url,
    alignment,
  } = entity.getData() as {
    id: string
    name: string
    imageFile: ImageEntityImageFile
    resized: ImageEntityResized
    desc: string
    url: string
    alignment: string
  }

  const imageWithMeta: ImageEntityWithMeta = {
    image: { id, name, imageFile, resized },
    desc,
    url,
  }

  const onImageSelectorChange: ImageSelectorOnChangeFn = (params, align) => {
    if (params.length === 0) {
      onEditFinish({})
    } else {
      const imageEntity = params[0]
      onEditFinish({
        entityKey,
        entityData: {
          ...imageEntity.image,
          desc: imageEntity.desc,
          url: imageEntity.url,
          alignment: align,
        },
      })
    }
    setToShowImageSelector(false)
  }

  return (
    <React.Fragment>
      {toShowImageSelector && (
        <ImageSelector
          onChange={onImageSelectorChange}
          enableCaption={true}
          enableUrl={true}
          enableAlignment={true}
          initialAlign={alignment}
          initialSelected={[imageWithMeta]}
        />
      )}
      <StyledImageBlock {...props} />
      <ImageEditButton
        onClick={() => {
          // call `onEditStart` prop as we are trying to update the BGImage entity
          onEditStart()
          // open `BGImageInput`
          setToShowImageSelector(true)
        }}
      >
        <i className="fa-solid fa-pen"></i>
        <span>Modify</span>
      </ImageEditButton>
    </React.Fragment>
  )
}
