import { ContentBlock, ContentState } from 'draft-js'
import React from 'react'
import styled from 'styled-components'

const defaultSpacingBetweenContent = '8px'
const narrowSpacingBetweenContent = '4px'

const InfoBoxRenderWrapper = styled.div`
  background: #f6f6fb;
  position: relative;
  padding: 24px 0px;
  width: calc(100% + 40px);
  transform: translateX(-20px);
  max-width: 560px;
  margin: auto auto 32px auto;

  @media screen and (min-width: 448px) {
    transform: none;
  }
`

const InfoTitle = styled.div`
  width: 100%;
  font-style: normal;
  font-weight: 700;
  font-size: 18px;
  line-height: 1.5;
  letter-spacing: 0.03em;
  color: #000928;
  border-left: 8px solid #04295e;
  padding: 0 32px 0 24px;
  margin-bottom: ${defaultSpacingBetweenContent};
`

const InfoContent = styled.div`
  padding: 0px 32px;
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 1.6;
  color: rgba(0, 9, 40, 0.87);

  > div > * + * {
    margin: ${defaultSpacingBetweenContent} 0 0;
  }

  //.public-DraftStyleDefault-header-two
  h2 {
    font-size: 24px;
    font-weight: 700;
    line-height: 1.5;
    letter-spacing: 0.032em;
    color: #000928;

    ${({ theme }) => theme.breakpoint.md} {
      font-size: 28px;
    }
  }

  //.public-DraftStyleDefault-ul
  ul {
    list-style-type: disc;
    padding-left: 1.2rem;

    //.public-DraftStyleDefault-unorderedListItem
    > li {
      letter-spacing: 0.01em;
      text-align: justify;
      color: rgba(0, 9, 40, 0.87);
    }

    > li + li {
      margin: ${narrowSpacingBetweenContent} 0 0;
    }
  }

  //.public-DraftStyleDefault-ol
  ol {
    list-style-type: decimal;
    padding-left: 1.2rem;

    //.public-DraftStyleDefault-orderedListItem
    > li {
      letter-spacing: 0.01em;
      text-align: justify;
      color: rgba(0, 9, 40, 0.87);
    }

    > li + li {
      margin: ${narrowSpacingBetweenContent} 0 0;
    }
  }

  a {
    display: inline;
    border-bottom: 2px solid #ebf02c;
    letter-spacing: 0.01em;
    text-align: justify;
    color: rgba(0, 9, 40, 0.87);
    padding-bottom: 2px;

    &:hover {
      border-bottom: 2px solid #04295e;
    }
  }
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

export function InfoBoxBlock(props: InfoBoxBlockProps) {
  const { block, contentState } = props
  const entityKey = block.getEntityAt(0)
  const entity = contentState.getEntity(entityKey)
  const { title, body } = entity.getData()

  return (
    <InfoBoxRenderWrapper className="infobox-wrapper">
      <InfoTitle className="infobox-title">{title}</InfoTitle>
      <InfoContent className="infobox-content">
        <div dangerouslySetInnerHTML={{ __html: body }} />
      </InfoContent>
    </InfoBoxRenderWrapper>
  )
}
