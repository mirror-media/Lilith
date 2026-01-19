import React, { useState } from 'react'
import styled from 'styled-components'
import { ContentBlock, ContentState } from 'draft-js'
import {
  ImageSelector,
  ImageSelectorOnChangeFn,
} from '../selector/image-selector'

const Image = styled.img`
  width: 100%;
`

const SlideshowCount = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  border-radius: 100%;
  border: black 1px solid;
  transform: translate(-50%, -50%);
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  aspect-ratio: 1;
  min-height: 66px;
  padding: 10px;
`

const Figure = styled.figure`
  position: relative;
  margin-block: unset;
  margin-inline: unset;
  margin: 0 10px;
`

const SlideshowEditButton = styled.span`
  cursor: pointer;
  background-color: white;
  padding: 6px;
  border-radius: 6px;
`

type SlideshowBlockProps = {
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

// support old version of slideshow without delay propertiy
export function SlideshowEditBlock(props: SlideshowBlockProps) {
  const { block, contentState } = props
  const entityKey = block.getEntityAt(0)
  const entity = contentState.getEntity(entityKey)

  const images = entity.getData()
  return (
    <Figure>
      <Image
        src={images?.[0]?.resized?.original}
        onError={(e) => (e.currentTarget.src = images?.[0]?.imageFile?.url)}
      />
      <SlideshowCount>+{images.length}</SlideshowCount>
    </Figure>
  )
}

// 202206 latest version of slideshow, support delay property
export function SlideshowEditBlockV2(props: SlideshowBlockProps) {
  const { block, blockProps, contentState } = props
  const { onEditStart, onEditFinish } = blockProps
  const entityKey = block.getEntityAt(0)
  const entity = contentState.getEntity(entityKey)

  const { images, delay } = entity.getData()
  const initialSelected = images.map((image) => ({
    desc: image.desc,
    image: {
      id: image.id,
      name: image.name,
      imageFile: image.imageFile,
      resized: image.resized,
      resizedWebp: image.resizedWebp,
    },
  }))

  const [toShowImageSelector, setToShowImageSelector] = useState(false)

  const onImageSelectorChange: ImageSelectorOnChangeFn = (
    selected,
    align,
    delay
  ) => {
    if (selected.length === 0) {
      onEditFinish({})
    } else {
      onEditFinish({
        entityKey,
        entityData: {
          alignment: align,
          delay,
          images: selected.map((ele) => {
            return {
              ...ele?.image,
              desc: ele?.desc,
            }
          }),
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
          enableDelay={true}
          enableMultiSelect={true}
          initialSelected={initialSelected}
          initialDelay={delay}
        />
      )}
      <Figure>
        <Image
          src={images?.[0]?.resized?.original}
          onError={(e) => (e.currentTarget.src = images?.[0]?.imageFile?.url)}
        />
        <SlideshowCount>
          <div>+{images.length}</div>
          {delay && <div>{`${delay}s`}</div>}
        </SlideshowCount>
      </Figure>
      <SlideshowEditButton
        onClick={() => {
          // call `onEditStart` prop as we are trying to update the BGImage entity
          onEditStart()
          // open `BGImageInput`
          setToShowImageSelector(true)
        }}
      >
        <i className="fa-solid fa-pen"></i>
        <span>Modify</span>
      </SlideshowEditButton>
    </React.Fragment>
  )
}
