import React, { useState } from 'react'
import styled from 'styled-components'
import { DraftEntityInstance } from 'draft-js'
import CustomImage from '@readr-media/react-image'
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

const Wrapper = styled.figure`
  margin-top: 20px;
  margin-bottom: 20px;
`
const Slideshow = styled.figure`
  overflow: hidden;
  position: relative;
`

const SlideImages = styled.div`
  display: flex;
  transition: transform 0.35s ease;

  ${({ move }) => move && `transform: translateX(${move * -100}%)`};
  .readr-media-react-image {
    object-position: center center;
    background-color: rgba(0, 0, 0, 0.1);
    max-width: 100%;
    min-width: 100%;
    max-height: 58.75vw;
    min-height: 58.75vw;
    ${({ theme }) => theme.breakpoint.md} {
      min-width: 640px;
      min-height: 428px;
      max-width: 640px;
      max-height: 428px;
    }
  }
`
const ClickButton = styled.button`
  position: absolute;
  top: 50%;
  z-index: 1;
  transform: translateY(-50%);
  color: white;
  height: 100%;
  width: 40px;
  &:focus {
    border: none;
    outline: none;
  }
  &::before {
    content: '';
    width: 16px;
    height: 16px;
    transform: rotate(45deg) translateY(-50%);
    cursor: pointer;
    display: block;
    position: absolute;
  }
`
const ClickButtonPrev = styled(ClickButton)`
  left: 0;
  &::before {
    border-left: 2px solid #fff;
    border-bottom: 2px solid #fff;
    left: 9px;
    transform: rotate(45deg) translate(0, -50%);
  }
`
const ClickButtonNext = styled(ClickButton)`
  right: 0;
  &::before {
    content: ' ';
    border-right: 2px solid #fff;
    border-top: 2px solid #fff;
    left: unset;
    transform: rotate(45deg) translate(-50%, 0);
    right: 9px;
  }
`
const Desc = styled.figcaption`
  font-size: 14px;
  line-height: 1.8;
  font-weight: 400;
  color: rgba(0, 0, 0, 0.5);
  margin-top: 20px;
  min-height: 1.8rem;
`
// support old version of slideshow without delay propertiy
export function SlideshowBlock(entity: DraftEntityInstance) {
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
export function SlideshowBlockV2(entity: DraftEntityInstance) {
  const [move, setMove] = useState(0)
  const { images } = entity.getData()
  const descOfCurrentImage = images?.[move]?.desc
  const total = images.length
  const displayedImage = images.map((image) => image.resized)

  const handleClickPrev = () => {
    if (move === 0) {
      setMove(total)
    }
    setMove((prevState) => prevState - 1)
  }

  const handleClickNext = () => {
    if (move === total - 1) {
      setMove(0)
    } else {
      setMove((prevState) => prevState + 1)
    }
  }

  return (
    <Wrapper>
      <Slideshow>
        <ClickButtonPrev onClick={handleClickPrev}></ClickButtonPrev>
        <ClickButtonNext onClick={handleClickNext}></ClickButtonNext>
        <SlideImages move={move}>
          {displayedImage.map((item, index) => (
            <CustomImage images={item} key={index} objectFit={'contain'} />
          ))}
        </SlideImages>
      </Slideshow>
      <Desc>{descOfCurrentImage}</Desc>
    </Wrapper>
  )
}
