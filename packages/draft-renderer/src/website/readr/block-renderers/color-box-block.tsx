import React from 'react'
import styled from 'styled-components'
import { ContentBlock, ContentState } from 'draft-js'

import {
  defaultH2Style,
  defaultUlStyle,
  defaultUnorderedListStyle,
  defaultOlStyle,
  defaultOrderedListStyle,
  defaultLinkStyle,
  defaultBlockQuoteStyle,
} from '../shared-style'

const colorBoxDefaultSpacing = 32

const ColorBoxRenderWrapper = styled.div`
  background-color: ${(props) => (props.color ? props.color : ' #FFFFFF')};
  padding: 12px 24px;
  position: relative;
  color: #000928;
  ${({ theme }) => theme.margin.default};

  > div > * + * {
    margin: ${colorBoxDefaultSpacing}px 0 0;
    min-height: 0.01px; //to make margins between paragraphs effective
  }

  h2 {
    ${defaultH2Style}
  }

  ul {
    ${defaultUlStyle}
    margin-top: ${colorBoxDefaultSpacing}px;

    > li {
      ${defaultUnorderedListStyle}

      & + li {
        margin: ${colorBoxDefaultSpacing / 2}px 0 0;
      }
    }
  }

  ol {
    ${defaultOlStyle}
    margin-top: ${colorBoxDefaultSpacing}px;

    > li {
      ${defaultOrderedListStyle}

      & + li {
        margin: ${colorBoxDefaultSpacing / 2}px 0 0;
      }
    }
  }

  a {
    ${defaultLinkStyle}
  }

  blockquote {
    ${defaultBlockQuoteStyle}
  }

  ${({ theme }) => theme.breakpoint.md} {
    padding: 16px 32px;
  }
`

type ColorBoxBlockProps = {
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

export function ColorBoxBlock(props: ColorBoxBlockProps) {
  const { block, contentState } = props
  const entityKey = block.getEntityAt(0)
  const entity = contentState.getEntity(entityKey)
  const { color, body } = entity.getData()

  return (
    <ColorBoxRenderWrapper color={color}>
      <div dangerouslySetInnerHTML={{ __html: body }} />
    </ColorBoxRenderWrapper>
  )
}
