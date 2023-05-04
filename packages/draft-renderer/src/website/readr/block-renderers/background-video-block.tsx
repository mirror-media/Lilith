import React, { useState, useEffect, useRef } from 'react'
import styled from 'styled-components'
import { ContentBlock, ContentState } from 'draft-js'

const BackgroundContainer = styled.section`
  clear: both;
  position: relative;
  margin: 32px calc(50% - 50vw) 0 !important;
  width: 100vw;
  min-height: 100vh;
`

const BackgroundVideo = styled.div`
  position: absolute;
  z-index: 1;
  top: 0;
  bottom: unset;
  left: 0;
  width: 100%;
  height: 100vh;
`

const BackgroundContentRow = styled.div``

const BackgroundContent = styled.div`
  position: relative;
  z-index: 1;
  &.static {
    height: 100vh;
    ${BackgroundContentRow} {
      position: absolute;
      bottom: 20px;
      left: 20px;
      right: 20px;
      text-shadow: 0px 0px 1px #000000;
      ${({ theme }) => theme.breakpoint.sm} {
        bottom: 40px;
      }
    }
  }
  &.parallax {
    ${BackgroundContentRow} {
      > div {
        background: rgba(169, 118, 118, 0.1);
        border-radius: 8px;
        padding: 20px;
        ${({ theme }) => theme.breakpoint.xl} {
          width: 480px;
        }

        > * + * {
          margin: 27px 0 0;
        }
        h2 {
          font-size: 1.44em;
          ${({ theme }) => theme.breakpoint.md} {
            font-size: 1.77em;
          }
        }
        h3 {
          font-size: 1.33em;
          ${({ theme }) => theme.breakpoint.md} {
            font-size: 1.55em;
          }
        }
        h4 {
          font-size: 1.11em;
          ${({ theme }) => theme.breakpoint.md} {
            font-size: 1.33em;
          }
        }
        ul {
          list-style-type: disc;
          list-style-position: inside;
        }
        ol {
          list-style-type: decimal;
          list-style-position: inside;
        }
      }
      &.left {
        padding: 0 20px 97px;
        ${({ theme }) => theme.breakpoint.md} {
          padding: 0 40px 335px;
        }
        ${({ theme }) => theme.breakpoint.xl} {
          padding: 0 80px 169px;
          padding-right: calc(100% - 480px - 80px);
        }
        ${({ theme }) => theme.breakpoint.xxl} {
          padding-bottom: 296px;
        }
      }
      &.right {
        padding: 0 20px 97px;
        ${({ theme }) => theme.breakpoint.md} {
          padding: 0 40px 335px;
        }
        ${({ theme }) => theme.breakpoint.xl} {
          padding: 0 80px 169px;
          padding-left: calc(100% - 480px - 80px);
        }
        ${({ theme }) => theme.breakpoint.xxl} {
          padding-bottom: 296px;
        }
      }
      &.bottom {
        padding: 0 20px 20px;
        ${({ theme }) => theme.breakpoint.md} {
          padding: 0 40px 40px;
        }
        ${({ theme }) => theme.breakpoint.xl} {
          padding: 0 calc(50% - 240px) 40px;
        }
        ${({ theme }) => theme.breakpoint.xxl} {
          padding-bottom: 80px;
        }
      }
    }
  }
`

const BackgroundEmptyRow = styled.div`
  height: 100vh;
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

export function BGVideoBlock(props: BGImageBlockProps) {
  const { block, contentState } = props
  const entityKey = block.getEntityAt(0)
  const entity = contentState.getEntity(entityKey)
  const { textBlockAlign, video, body } = entity.getData()
  // 滾動視差
  const isParallax = textBlockAlign !== 'fixed'

  const [bgVideoCss, setBgVideoCss] = useState({})
  const bgRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const topRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (bgRef.current && topRef.current && bottomRef.current) {
      const intersectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach(({ boundingClientRect }) => {
            if (
              !boundingClientRect.width ||
              !videoRef.current ||
              !bgRef.current
            ) {
              return
            }

            const bounding = bgRef.current.getBoundingClientRect()
            if (isParallax) {
              if (bounding.y > 0) {
                // before block top touch viewport top, set the video to the top of block
                setBgVideoCss({
                  position: 'absolute',
                  top: 0,
                  bottom: 'unset',
                })
                videoRef.current.pause()
              } else if (bounding.y + bounding.height >= window.innerHeight) {
                // after block top touch viewport top, fix the video to viewport
                setBgVideoCss({
                  position: 'fixed',
                  top: 0,
                  bottom: 'unset',
                })
                videoRef.current.play()
              } else {
                // after block bottom leave viewport bottom, set the video to the bottom of block
                setBgVideoCss({
                  position: 'absolute',
                  top: 'unset',
                  bottom: 0,
                })
                videoRef.current.pause()
              }
            }

            if (!isParallax) {
              if (
                bounding.y > window.innerHeight * 0.3 ||
                bounding.y < -window.innerHeight * 0.3
              ) {
                videoRef.current.pause()
              } else {
                videoRef.current.play()
              }
            }
          })
        },
        {
          threshold: [0, 0.4, 0.7, 1.0],
        }
      )

      if (!isParallax) {
        intersectionObserver.observe(bgRef.current)
      } else {
        intersectionObserver.observe(topRef.current)
        intersectionObserver.observe(bottomRef.current)
      }
      return () => {
        intersectionObserver.disconnect()
      }
    }
  }, [isParallax])

  return (
    <BackgroundContainer ref={bgRef} className="bg">
      <div ref={topRef} />
      <BackgroundVideo style={bgVideoCss}>
        <video
          ref={videoRef}
          src={video?.url}
          muted
          preload="auto"
          loop
          playsInline
        />
      </BackgroundVideo>
      <BackgroundContent className={isParallax ? 'parallax' : 'static'}>
        {isParallax && <BackgroundEmptyRow />}
        <BackgroundContentRow className={textBlockAlign}>
          <div dangerouslySetInnerHTML={{ __html: body }} />
        </BackgroundContentRow>
      </BackgroundContent>
      <div ref={bottomRef} />
    </BackgroundContainer>
  )
}
