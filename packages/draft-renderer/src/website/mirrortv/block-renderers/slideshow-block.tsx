import React, { useState, useEffect, useRef, useMemo } from 'react'
import styled from 'styled-components'
import { EntityInstance } from 'draft-js'
import { defaultMarginTop, defaultMarginBottom } from '../shared-style'
import CustomImage from '@readr-media/react-image'
import defaultImage from '../assets/default-og-img.png'
import loadingImage from '../assets/loading.gif'

type ImageType = Record<
  'w480' | 'w800' | 'w1200' | 'w1600' | 'w2400' | 'original',
  string
>

type ImageResized = ImageType
type ImageResizedWebp = ImageType | null
import AmpSlideshowBlockV2 from './amp/amp-slideshow-block'
import { ContentLayout } from '../types'

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
  ${defaultMarginTop}
  ${defaultMarginBottom}
`

const SlideshowV2 = styled.figure`
  touch-action: pan-y;
  overflow: hidden;
  position: relative;
  width: ${sliderWidth};
  z-index: 1;
`

const SlidesBox = styled.div`
  display: flex;
  position: relative;
  top: 0;

  width: ${sliderWidth};

  ${({ isShifting }) =>
    isShifting ? 'transition: transform 0.3s ease-out' : null};

  .readr-media-react-image {
    object-position: center center;
    background-color: transparent;
    max-width: ${sliderWidth};
    min-width: ${sliderWidth};
    max-height: 58.75vw;
    min-height: 58.75vw;
    ${({ theme }) => theme.breakpoint.md} {
      min-width: 100%;
      min-height: 428px;
      max-width: 100%;
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
    filter: drop-shadow(0 0 1.5px #000);
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
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji',
    'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
`

// support old version of slideshow without delay propertiy
export function SlideshowBlock(entity: EntityInstance) {
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
export function SlideshowBlockV2(
  entity: EntityInstance,
  contentLayout: ContentLayout
) {
  const slidesBoxRef = useRef<HTMLDivElement>(null)
  /** Current index of the displayed slide */
  const [indexOfCurrentImage, setIndexOfCurrentImage] = useState(0)
  /** Whether allow slide shifting animation */
  const [isShifting, setIsShifting] = useState(false)
  /* Distance of dragging, which will increase/decrease value when dragging, and reset to `0` when dragging complete */
  const [dragDistance, setDragDistance] = useState(0)
  /** Position of slide box */
  const slideBoxPosition = `calc(${sliderWidth} * ${slidesOffset +
    indexOfCurrentImage} * -1 + ${dragDistance}px)`
  /**
   * TODO: add type in images
   */
  const { images } = useMemo(() => entity.getData(), [entity])

  type DisplayedImage = {
    resized: ImageResized
    resizedWebp: ImageResizedWebp
  }
  const displayedImage: Array<DisplayedImage> = useMemo(
    () =>
      images.map((image) => {
        const { resized, resizedWebp } = image
        return { resized, resizedWebp }
      }),
    images
  )
  const slidesLength = images.length
  const descOfCurrentImage = images?.[indexOfCurrentImage]?.desc

  if (contentLayout === 'amp') {
    return <AmpSlideshowBlockV2 entity={entity} />
  }

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
  const slidesWithClone = useMemo(
    () => [
      ...displayedImage.slice(-slidesOffset),
      ...displayedImage,
      ...displayedImage?.slice(0, slidesOffset),
    ],
    [displayedImage]
  )

  const slidesJsx = useMemo(
    () =>
      slidesWithClone.map((item, index) => {
        /**
         * Why image with this index should load immediately?
         * Assuming there are three images [ A, B, C ] for slideshow.
         * After cloning, there is seven images [ B(clone), C(clone), A, B, C, A(clone), B(clone) ] for rendering.
         * If user dragging from A to C(clone), after dragging, the function `handleTransitionEnd` will set state `setIndexOfCurrentImage`,
         * and then display 'C'.
         * However, before dragging, C is not loaded, and after `handleTransitionEnd` is triggered, C is on appear and start to lazy-load,
         * and before C is loaded, there is no image show on the screen.
         * At the point of user experience, the slideshow will flash and blink: Has Image C -> No Image -> Has Image C again.
         * To avoid this problem to hurt user experience, we decide to immediately load image C, despite time of initial load will longer.
         *
         */
        const isNeedToLoadImmediately =
          index === slidesLength + slidesOffset - 1
        return (
          <CustomImage
            images={item.resized}
            imagesWebP={item.resizedWebp}
            key={index}
            loadingImage={loadingImage}
            defaultImage={defaultImage}
            objectFit={'contain'}
            priority={isNeedToLoadImmediately}
            intersectionObserverOptions={{
              root: null,
              rootMargin: '0px',
              threshold: 0,
            }}
          />
        )
      }),
    [slidesWithClone]
  )

  const handleClickPrev = () => {
    if (isShifting) {
      return
    }
    setIsShifting(true)
    setIndexOfCurrentImage((pre) => pre - 1)
  }

  const handleClickNext = () => {
    if (isShifting) {
      return
    }
    setIsShifting(true)
    setIndexOfCurrentImage((pre) => pre + 1)
  }

  /**
   * Check `indexOfCurrentImage` after transition and reset if needed.
   * It is needed to reset if scrolling backward from the first image to the last image,
   * or scrolling forward from the last image to the first image.
   */
  const handleTransitionEnd = () => {
    setIsShifting(false)
    if (indexOfCurrentImage <= -1) {
      setIndexOfCurrentImage(slidesLength - 1)
    } else if (indexOfCurrentImage >= slidesLength) {
      setIndexOfCurrentImage(0)
    }
  }

  useEffect(() => {
    const slidesBox = slidesBoxRef?.current
    if (slidesBox) {
      /** Threshold of slide change */
      const threshold = 0.25
      let dragDistance = 0
      /** Position of pointer when start dragging */
      let dragStartPositionX = 0

      /**
       * Record the mouse position and slidesBox position when dragging starts,
       * and register dragEnd and dragAction for pointer-related events
       */
      const dragStart = (e: PointerEvent) => {
        e.preventDefault()
        dragStartPositionX = e.pageX

        slidesBox.addEventListener('pointerup', dragEnd)
        slidesBox.addEventListener('pointerout', dragEnd)
        slidesBox.addEventListener('pointermove', dragAction)
      }

      /**
       * Calculate the distance of dragging, and adjust moving distance of the slidesBox accordingly to achieve dragging effect.
       * It will recalculate the value of current position of slidesBox, starting position of dragging,
       * distance of dragging when slidesBox is dragging.
       */
      const dragAction = (e: PointerEvent) => {
        dragDistance = e.pageX - dragStartPositionX
        setDragDistance(dragDistance)
      }
      /**
       * Calculate the position of `slidesBox` to decider should show next of previous image.
       */
      const dragEnd = () => {
        setIsShifting(true)
        if (dragDistance / slidesBox.offsetWidth < -threshold) {
          //move forward to show next image
          setIndexOfCurrentImage((pre) => pre + 1)
        } else if (dragDistance / slidesBox.offsetWidth > threshold) {
          //move backward to show previous image
          setIndexOfCurrentImage((pre) => pre - 1)
        } else {
          //do not move, show current image
        }

        //reset drag distance

        dragDistance = 0
        setDragDistance(0)

        slidesBox.removeEventListener('pointerup', dragEnd)
        slidesBox.removeEventListener('pointerout', dragEnd)
        slidesBox.removeEventListener('pointermove', dragAction)
      }

      // Add listener of Drag events
      slidesBox.addEventListener('pointerdown', dragStart)

      return () => {
        slidesBox.removeEventListener('pointerdown', dragStart)
      }
    }
  }, [])

  return (
    <Wrapper>
      <SlideshowV2>
        <ClickButtonPrev onClick={handleClickPrev}></ClickButtonPrev>
        <ClickButtonNext onClick={handleClickNext}></ClickButtonNext>
        <SlidesBox
          style={{ transform: `translateX(${slideBoxPosition})` }}
          ref={slidesBoxRef}
          amount={slidesWithClone.length}
          isShifting={isShifting}
          index={indexOfCurrentImage}
          onTransitionEnd={handleTransitionEnd}
        >
          {slidesJsx}
        </SlidesBox>
      </SlideshowV2>
      <Desc>{descOfCurrentImage}</Desc>
    </Wrapper>
  )
}
