import React from 'react'
import { ContentBlock, ContentState } from 'draft-js'
import styled, { css } from 'styled-components'

//for setting background color info box
const backgroundColorNormal = '#054f77'
const backgroundColorWide = '#F2F2F2'
const textColorNormal = '#c4c4c4'
const textColorWide = 'rgba(0, 0, 0, 0.66)'

const infoBoxWrapperNormal = css`
  background-color: ${backgroundColorNormal};
  color: ${textColorNormal};
  > h2 {
    color: #ffffff;
  }
`
const infoBoxWrapperWide = css`
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji',
    'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
  background-color: ${backgroundColorWide};
  color: ${textColorWide};
  border-top: 2px solid #054f77;
  filter: drop-shadow(0px 4px 12px rgba(0, 0, 0, 0.08))
    drop-shadow(0px 2px 28px rgba(0, 0, 0, 0.06));

  > h2 {
    color: black;
  }
`

const InfoBoxRenderWrapper = styled.div`
  padding: 32px 30px 22px 30px;
  margin-top: 20px;
  margin-bottom: 20px;
  position: relative;
  > h2 {
    font-size: 20px;
    line-height: 1.5;
    margin-bottom: 18px;
  }

  ${({ contentLayout }) => {
    switch (contentLayout) {
      case 'normal':
        return infoBoxWrapperNormal
      case 'wide':
        return infoBoxWrapperWide
      default:
        return infoBoxWrapperNormal
    }
  }}
`

const infoBoxBodyNormal = css`
  ul {
    li {
      &::before {
        background-color: ${textColorNormal};
      }
    }
  }
  ol {
    li {
      &::before {
        color: ${textColorNormal};
      }
    }
  }
`
const infoBoxBodyWide = css`
  ul {
    li {
      &::before {
        background-color: ${textColorWide};
      }
    }
  }
  ol {
    li {
      &::before {
        color: ${textColorWide};
      }
    }
  }
`
const infoBoxLineHeight = 1.8
const InfoBoxBody = styled.div`
  > * + * {
    margin-top: 20px;
  }
  font-size: 16px;
  line-height: ${infoBoxLineHeight};
  a {
    text-decoration: underline;
  }
  ul {
    margin-left: 18px;

    li {
      position: relative;
      &::before {
        content: '';
        position: absolute;
        top: calc((1rem * ${infoBoxLineHeight}) / 2);
        left: -12px;
        width: 6px;
        height: 6px;
        transform: translate(-50%, -50%);
        border-radius: 50%;
      }
    }
  }
  ol {
    margin-left: 18px;
    li {
      position: relative;
      counter-increment: list;
      padding-left: 6px;
      &::before {
        content: counter(list) '.';
        position: absolute;
        left: -15px;
        width: 15px;
      }
    }
  }
  ${({ contentLayout }) => {
    switch (contentLayout) {
      case 'normal':
        return infoBoxBodyNormal
      case 'wide':
        return infoBoxBodyWide
      default:
        return infoBoxBodyNormal
    }
  }}
`

type InfoBoxBlockProps = {
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

export function InfoBoxBlock(
  props: InfoBoxBlockProps,
  contentLayout = 'normal'
) {
  const { block, contentState } = props

  const entityKey = block.getEntityAt(0)
  const entity = contentState.getEntity(entityKey)
  const { title, body } = entity.getData()

  return (
    <InfoBoxRenderWrapper contentLayout={contentLayout}>
      <h2>{title}</h2>
      <InfoBoxBody
        contentLayout={contentLayout}
        dangerouslySetInnerHTML={{ __html: body }}
      />
    </InfoBoxRenderWrapper>
  )
}
