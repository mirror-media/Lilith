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

  ${({ shouldShift }) =>
    shouldShift ? 'transition: left 0.3s ease-out' : null};

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
  /** Current index of the displayed slide */
  const [indexOfCurrentImage, setIndexOfCurrentImage] = useState(0)
  /** Whether allow slide shifting animation*/
  const [shouldShift, setShouldShift] = useState(false)

  const { images } = entity.getData()
  const displayedImage = images.map((image) => image.resized)
  const slidesLength = images.length
  const descOfCurrentImage = images?.[indexOfCurrentImage]?.desc

  /**
   * Clone first and last slide.
   * Assuming there are three images [ A, B, C ] for slideshow.
   * After cloning, there is seven images [ B(clone), C(clone), A, B, C, A(clone), B(clone) ] for rendering.
   * Users can see the previous or next image in the process of dragging.
   * For example, if drag backward from first A (the third image in array), users can see C(clone) and B(clone) when dragging.
   *
   * The cloned element is only show in the process of dragging.
   * For example, even if users drag backward from first A, and stop it at C(clone), the slide is showing C , not C(clone).
   * We doing this effect by recalculating the position of slide box.
   *
   * Why did cloned element only show at the process of dragging, and not show when dragging is end? There is two purposes:
   * 1. Show cloned element at the process of dragging, is let users can see last image even if drag backward from first image.
   * 2. Now Show cloned element displayed after the dragging is because if we displayed the cloned element, next dragging process will not as expected.
   *    For example, if we display C(clone), the next time users drag, there will be no element to drag when dragging backwards.
   *
   * The amount of item need to clone is decided by variable `slidesOffset`
   */
  const slidesWithClone = [].concat(
    displayedImage?.slice(-slidesOffset),
    displayedImage,
    displayedImage?.slice(0, slidesOffset)
  )
  const slidesJsx = slidesWithClone.map((item, index) => (
    <CustomImage images={item} key={index} objectFit={'contain'} />
  ))

  /**
   * Shifts the current slide image forward or backward based on the given direction.
   * It will increase or decrease the value of `indexOfCurrentImage`, and affect the position of slideBox.
   */
  const shiftSlide = (slideDirection: 'forward' | 'backward') => {
    if (shouldShift) {
      return
    }
    setShouldShift(true)
    if (slideDirection === 'forward') {
      setIndexOfCurrentImage((prevState) => prevState + 1)
    } else if (slideDirection === 'backward') {
      setIndexOfCurrentImage((prevState) => prevState - 1)
    }
  }

  /**
   * Check `indexOfCurrentImage` after transition and reset if needed.
   * It is needed to reset if scrolling backward from the first image to the last image,
   * or scrolling forward from the last image to the first image.
   */
  const handleTransitionEnd = () => {
    setShouldShift(false)
    if (indexOfCurrentImage === -1) {
      setIndexOfCurrentImage(slidesLength - 1)
    } else if (indexOfCurrentImage === slidesLength) {
      setIndexOfCurrentImage(0)
    }
  }

  useEffect(() => {
    const slidesBox = slidesBoxRef?.current
    if (slidesBox) {
      /** Threshold of slide change */
      const threshold = 100

      /** Position of pointer when start dragging */
      let dragStartPositionX = 0
      /** Position of slides when start dragging */
      let slidesBoxInitialX = slidesBox.offsetLeft

      /**
       * Record the mouse position and slidesBox position when dragging starts,
       * and register dragEnd and dragAction for pointer-related events
       */
      const dragStart = (e: PointerEvent) => {
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
        }
        document.removeEventListener('pointerup', dragEnd)
        document.removeEventListener('pointercancel', dragEnd)
        document.removeEventListener('pointerleave', dragEnd)
        document.removeEventListener('pointermove', dragAction)
      }

      // Add listener of Drag events
      slidesBox.addEventListener('pointerdown', dragStart)

      return () => {
        slidesBox.removeEventListener('pointerdown', dragStart)
      }
    }
  }, [])

  /**
   * Move the position of slidesBox by `indexOfCurrentImage` to achieve the effect of switching slides
   */
  useEffect(() => {
    const slidesBox = slidesBoxRef?.current
    if (slidesBox) {
      slidesBox.style.left = `calc((${indexOfCurrentImage +
        slidesOffset}) * ${sliderWidth} * -1)`
    }
  })
  return (
    <Wrapper>
      <SlideshowV2>
        <ClickButtonPrev
          onClick={() => shiftSlide('backward')}
        ></ClickButtonPrev>
        <ClickButtonNext
          onClick={() => shiftSlide('forward')}
        ></ClickButtonNext>
        <SlidesBox
          ref={slidesBoxRef}
          amount={slidesWithClone.length}
          shouldShift={shouldShift}
          onTransitionEnd={handleTransitionEnd}
        >
          {slidesJsx}
        </SlidesBox>
      </SlideshowV2>
      <Desc>{descOfCurrentImage}</Desc>
    </Wrapper>
  )
}
