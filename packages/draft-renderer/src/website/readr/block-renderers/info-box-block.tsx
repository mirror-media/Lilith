import { ContentBlock, ContentState } from 'draft-js'
import React from 'react'
import styled from 'styled-components'

const InfoBoxRenderWrapper = styled.div`
  background: #f6f6fb;
  position: relative;
  padding: 24px 0;
  width: calc(100% + 40px);
  transform: translateX(-20px);
  max-width: 448px;
  margin: auto;

  @media screen and (min-width: 448px) {
    transform: none;
  }
`

const InfoTitle = styled.div`
  width: 100%;
  font-style: normal;
  font-weight: 700;
  font-size: 18px;
  line-height: 150%;
  letter-spacing: 0.03em;
  color: #000928;
  border-left: 8px solid #04295e;
  padding: 0 32px 0 24px;
  margin-bottom: 8px;
`

const InfoContent = styled.div`
  padding: 0px 32px;
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 160%;
  color: rgba(0, 9, 40, 0.87);

  // margin between paragraph
  > div > * + * {
    margin: 16px 0 0;
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

  //.public-DraftStyleDefault-blockquote
  blockquote {
    width: 100%;
    padding: 0 12px;
    text-align: right;
    margin: 40px auto 64px;

    span {
      display: block;
      font-weight: 700;
      font-size: 20px;
      line-height: 1.5;
      text-align: justify;
      color: rgba(0, 9, 40, 0.87);
      margin: 0 0 16px;
    }

    &::before {
      content: url('https://upload.wikimedia.org/wikipedia/commons/2/25/Quote_left_font_awesome.svg');
      display: block;
      margin: 0 auto 16px auto;
      width: 24px;
      height: 24px;
    }

    ${({ theme }) => theme.breakpoint.md} {
      padding: 0;
      width: 480px;
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
    <InfoBoxRenderWrapper>
      <InfoTitle>{title}</InfoTitle>
      <InfoContent>
        <div dangerouslySetInnerHTML={{ __html: body }} />
      </InfoContent>
    </InfoBoxRenderWrapper>
  )
}
