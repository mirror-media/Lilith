import React, { useState } from 'react'
import styled from 'styled-components'

import annotationArrow from '../assets/annotation-arrow.png'
import {
  defaultH2Style,
  defaultLinkStyle,
  defaultOlStyle,
  defaultOrderedListStyle,
  defaultUlStyle,
  defaultUnorderedListStyle,
  defaultBlockQuoteStyle,
} from '../shared-style'

const annotationDefaultSpacing = 8

const AnnotationText = styled.span`
  ${defaultLinkStyle};
`

const AnnotationWrapper = styled.span`
  display: inline-block;
  cursor: pointer;

  &:hover ${AnnotationText} {
    border-bottom: 2px solid #04295e;
  }
`

const AnnotationBody = styled.div`
  border-radius: 2px;
  background-color: #f6f6fb;
  padding: 12px 24px;
  margin: 8px 0 32px;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.6;
  display: inline-block;
  text-align: left;
  width: 100%;
  color: rgba(0, 9, 40, 0.87);

  ${({ theme }) => theme.breakpoint.md} {
    padding: 16px 32px;
  }

  > * + * {
    margin: ${annotationDefaultSpacing}px 0 0;
    min-height: 0.01px; //to make margins between paragraphs effective
  }

  h2 {
    ${defaultH2Style}
  }

  ul {
    ${defaultUlStyle}
    margin-top: ${annotationDefaultSpacing}px;

    > li {
      ${defaultUnorderedListStyle}
    }
  }

  ol {
    ${defaultOlStyle}
    margin-top: ${annotationDefaultSpacing}px;

    > li {
      ${defaultOrderedListStyle}
    }
  }

  a {
    ${defaultLinkStyle}
  }

  blockquote {
    ${defaultBlockQuoteStyle}
  }
`

const ArrowIcon = styled.span`
  width: 24px;
  height: 24px;
  background-image: url(${annotationArrow});
  background-repeat: no-repeat;
  background-position: center center;
  background-size: 24px;
  margin: auto 4px;
  transition: transform 0.3s;
  display: inline-flex;
  vertical-align: text-top;
  transform: ${(props) => (props.showContent ? 'rotate(-180deg)' : '')};
`

function AnnotationBlock(props) {
  const { children: annotated } = props
  const [showContent, setShowContent] = useState(false)
  /**
   * to support k5 old annotation data, check if annotation key exist
   * k5
   * {
   *    text: string,
   *     annotation: html string,
   *     draftRawObj: DraftBlocks
   * }
   * k6
   * {
   *   bodyHTML: string,
   *   bodyEscapedHTML: string,
   *   rawContentState: DraftBlocks
   * }
   */
  const { bodyHTML, annotation } = props.contentState
    .getEntity(props.entityKey)
    .getData()
  const annotationBodyHtml = bodyHTML || annotation.trim()
  return (
    <React.Fragment>
      <AnnotationWrapper
        onClick={(e) => {
          e.preventDefault()
          setShowContent(!showContent)
        }}
      >
        <AnnotationText className="text">{annotated}</AnnotationText>
        <ArrowIcon showContent={showContent} />
      </AnnotationWrapper>
      {showContent ? (
        <AnnotationBody
          contentEditable={false}
          dangerouslySetInnerHTML={{ __html: annotationBodyHtml }}
        ></AnnotationBody>
      ) : null}
    </React.Fragment>
  )
}

function findAnnotationEntities(contentBlock, callback, contentState) {
  contentBlock.findEntityRanges((character) => {
    const entityKey = character.getEntity()
    return (
      entityKey !== null &&
      contentState.getEntity(entityKey).getType() === 'ANNOTATION'
    )
  }, callback)
}

export const annotationDecorator = {
  strategy: findAnnotationEntities,
  component: AnnotationBlock,
}
