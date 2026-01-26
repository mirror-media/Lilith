import React from 'react'
import styled from 'styled-components'
import { EntityInstance } from 'draft-js'
import { defaultMarginTop, defaultMarginBottom } from '../../shared-style'

const Wrapper = styled.figure`
  ${defaultMarginTop}
  ${defaultMarginBottom}
  position: relative;
  height: calc(58.75vw + 80px);
  ${({ theme }) => theme.breakpoint.md} {
    height: 508px;
  }

  .amp-carousel-button {
    position: absolute;
    top: calc(50% - 40px);
    z-index: 1;
    transform: translateY(-50%);
    color: white;
    height: calc(100% - 80px);
    width: 40px;
    background: none;
    &:focus {
      border: none;
      outline: none;
    }
    &::before {
      position: absolute;
      content: '';
      width: 16px;
      height: 16px;
      top: 50%;
      cursor: pointer;
      display: block;
    }
  }

  .amp-carousel-button-prev {
    left: 0;
    &::before {
      border-left: 2px solid #fff;
      border-bottom: 2px solid #fff;
      left: 9px;
      transform: rotate(45deg) translate(0, -50%);
    }
  }

  .amp-carousel-button-next {
    right: 0;
    &::before {
      content: ' ';
      border-right: 2px solid #fff;
      border-top: 2px solid #fff;
      left: unset;
      transform: rotate(45deg) translate(-50%, 0);
      right: 9px;
    }
  }
`

const SlideImage = styled.div`
  position: relative;
  object-position: center center;
  background-color: rgba(0, 0, 0, 0.1);
  width: 100%;
  height: 58.75vw;
  ${({ theme }) => theme.breakpoint.md} {
    height: 428px;
  }

  .contain img {
    object-fit: contain;
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
  max-height: 60px;
  overflow: scroll;
`

export default function AmpSlideshowBlockV2({
  entity,
}: {
  entity: EntityInstance
}) {
  const { images = [], delay = 2 } = entity.getData()

  return (
    <Wrapper>
      <amp-carousel
        layout="fill"
        type="slides"
        autoplay=""
        loop=""
        delay={delay * 1000}
        aria-label="Carousel"
      >
        {images.map((slide) => {
          return (
            <figure key={slide.id}>
              <SlideImage>
                <amp-img
                  class="contain"
                  src={slide?.resized?.original}
                  layout="fill"
                  alt={slide?.name || 'slide'}
                ></amp-img>
              </SlideImage>
              <Desc>{slide.desc}</Desc>
            </figure>
          )
        })}
      </amp-carousel>
    </Wrapper>
  )
}
