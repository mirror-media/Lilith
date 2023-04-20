import React from 'react'
import styled from 'styled-components'
import { DraftEntityInstance } from 'draft-js'

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

// support old version of slideshow without delay propertiy
export function SlideshowEditBlock(entity: DraftEntityInstance) {
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
export function SlideshowEditBlockV2(entity: DraftEntityInstance) {
  const { images, delay } = entity.getData()
  return (
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
  )
}
