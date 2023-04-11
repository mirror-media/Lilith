import React, { useState, useEffect, useRef } from 'react'
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

const sliderWidth = '100%'

const slidesOffset = 2

const Wrapper = styled.figure`
  margin-top: 20px;
  margin-bottom: 20px;
`

const SlideshowV2 = styled.figure`
  touch-action: none;
  overflow: hidden;
  position: relative;
  width: ${sliderWidth};
  z-index: 1;
`

const SlidesBox = styled.div`
  display: flex;
  position: relative;
  top: 0;
  left: ${`calc(${sliderWidth} * ${slidesOffset} * -1)`};
  width: ${sliderWidth};
  &.shifting {
    transition: left 0.3s ease-out;
  }

  .readr-media-react-image {
    object-position: center center;
    background-color: rgba(0, 0, 0, 0.1);
    max-width: ${sliderWidth};
    min-width: ${sliderWidth};
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

/**
 * Supports sliding with mouse drag, and button clicks for navigation.
 *
 * Inspired by [Works of Claudia Conceicao](https://codepen.io/cconceicao/pen/PBQawy),
 * [twreporter slideshow component](https://github.com/twreporter/twreporter-npm-packages/blob/master/packages/react-article-components/src/components/body/slideshow/index.js)
 */
export function SlideshowBlockV2(entity: DraftEntityInstance) {
  const slidesBoxRef = useRef<HTMLDivElement>(null)
  const prevRef = useRef<HTMLButtonElement>(null)
  const nextRef = useRef<HTMLButtonElement>(null)
  const [indexOfCurrentImage, setIndexOfCurrentImage] = useState(0)
  const { images } = entity.getData()
  const displayedImage = images.map((image) => image.resized)
  const slidesLength = images.length
  const descOfCurrentImage = images?.[indexOfCurrentImage]?.desc

  /**
   * Clone first and last slide.
   * Assuming there are three images [ A, B, C ] for slideshow.
   * After cloning, there is seven images [ C, B, A, B, C, A, B ] for rendering.
   * If users drag backward from first A (the third image in array), users can see C (the first image)and B (the second image).
   * The cloned element is only used for the dragging effect. After switching the slide, cloned element will not be displayed,
   * but recalculating the image that should be displayed in the original array by executing function `checkIndex`。
   * The amount of item need to clone is decide by variable `slidesOffset`
   */
  const slidesWithClone = []?.concat(
    displayedImage?.slice(-slidesOffset),
    displayedImage,
    displayedImage?.slice(0, slidesOffset)
  )
  const slidesJsx = slidesWithClone.map((item, index) => (
    <CustomImage
      images={item}
      key={index}
      objectFit={'contain'}
      debugMode={true}
    />
  ))

  useEffect(() => {
    const slidesBox = slidesBoxRef?.current
    const prev = prevRef?.current
    const next = nextRef?.current
    if (slidesBox && prev && next) {
      /** Current index of the displayed slide */
      let index = 0
      /** Whether allow slide shifting animation*/
      let allowShift = true
      /** Threshold of slide change */
      const threshold = 100

      /** Position of pointer when start dragging */
      let dragStartPositionX = 0
      /** Position of slides when start dragging */
      let slidesBoxInitialX = slidesBox.offsetLeft

      /**
       * Record the mouse position and slidesBox position when dragging starts,
       * and register dragEnd and dragAction for pointer-related events
       * @param {PointerEvent} e
       */
      const dragStart = (e) => {
        e.preventDefault()
        dragStartPositionX = e.pageX
        slidesBoxInitialX = slidesBox.offsetLeft
        document.addEventListener('pointerup', dragEnd)
        document.addEventListener('pointercancel', dragEnd)
        document.addEventListener('pointerleave', dragEnd)
        document.addEventListener('pointermove', dragAction)
      }

      /**
       * Calculate the distance of dragging, and adjust moving distance of the slidesBox accordingly to achieve dragging effect.
       * It will recalculate the value of current position of slidesBox, starting position of dragging,
       * distance of dragging when slidesBox is dragging.
       */
      const dragAction = (e: PointerEvent) => {
        const dragDistance = e.pageX - dragStartPositionX
        dragStartPositionX = e.pageX

        slidesBox.style.left = `${slidesBox.offsetLeft + dragDistance}px`
      }
      /**
       * Calculate the position of `slidesBox` to decider should show next of previous image.
       */
      const dragEnd = () => {
        const sliderFinalX = slidesBox.offsetLeft
        if (sliderFinalX - slidesBoxInitialX < -threshold) {
          //move forward to show next image
          shiftSlide('forward')
        } else if (sliderFinalX - slidesBoxInitialX > threshold) {
          //move backward to show previous image
          shiftSlide('backward')
        } else {
          //do not move, show current image
          shiftSlide('stay')
        }
        document.removeEventListener('pointerup', dragEnd)
        document.removeEventListener('pointercancel', dragEnd)
        document.removeEventListener('pointerleave', dragEnd)
        document.removeEventListener('pointermove', dragAction)
      }
      /**
       * Move the position of slidesBox by adjusting the index to achieve the effect of switching slides
       */
      const shiftSlide = (slideDirection: 'forward' | 'backward' | 'stay') => {
        slidesBox.classList.add('shifting')
        if (allowShift) {
          if (slideDirection === 'forward') {
            index += 1
          } else if (slideDirection === 'backward') {
            index -= 1
          }
          slidesBox.style.left = `calc((${index +
            slidesOffset}) * ${sliderWidth} * -1)`
          setIndexOfCurrentImage(index)
        }

        allowShift = false
      }
      /**
       * Check and reset index if needed.
       * It is needed to reset index if scrolling backward from the first image to the last image,
       * or scrolling forward from the last image to the first image.
       * After reset, we need to update inline style `left` of slides items according to updated index.
       */
      const checkIndex = () => {
        slidesBox.classList.remove('shifting')
        //from first image move backward to last image
        if (index === -1) {
          index = slidesLength - 1
        }
        //from last image move forward to last image
        else if (index === slidesLength) {
          index = 0
        }
        slidesBox.style.left = `calc((${index +
          slidesOffset}) * ${sliderWidth} * -1)`

        setIndexOfCurrentImage(index)
        allowShift = true
      }

      // Drag events
      slidesBox.addEventListener('pointerdown', dragStart)

      // Click events
      prev.addEventListener('pointerdown', () => shiftSlide('backward'))
      next.addEventListener('pointerdown', () => shiftSlide('forward'))

      // Transition events
      slidesBox.addEventListener('transitionend', checkIndex)

      return () => {
        slidesBox.removeEventListener('pointerdown', dragStart)
        prev.removeEventListener('pointerdown', () => shiftSlide('backward'))
        next.removeEventListener('pointerdown', () => shiftSlide('forward'))
        slidesBox.removeEventListener('transitionend', checkIndex)
      }
    }
  }, [])
  return (
    <Wrapper>
      <SlideshowV2>
        <ClickButtonPrev ref={prevRef}></ClickButtonPrev>
        <ClickButtonNext ref={nextRef}></ClickButtonNext>
        <SlidesBox ref={slidesBoxRef} amount={slidesWithClone.length}>
          {slidesJsx}
        </SlidesBox>
      </SlideshowV2>
      <Desc>{descOfCurrentImage}</Desc>
    </Wrapper>
  )
}
