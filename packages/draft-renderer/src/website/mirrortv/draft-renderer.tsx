import React, { ReactNode } from 'react'
import styled, { css, ThemeProvider } from 'styled-components'

import { Editor, EditorState, convertFromRaw } from 'draft-js'
import blockquoteDecoration from './assets/blockquote-decoration.png'
import { atomicBlockRenderer } from './block-renderer-fn'
import decoratorsGenerator from './entity-decorator'
import {
  CUSTOM_STYLE_PREFIX_FONT_COLOR,
  CUSTOM_STYLE_PREFIX_BACKGROUND_COLOR,
} from '../../draft-js/const'
import { defaultMarginBottom } from './shared-style'
import theme from './theme'
import { ContentLayout } from './types'
export const draftEditorLineHeight = 2
/**
 * Due to the data structure from draftjs, each default block contain one HTML element which class name is `public-DraftStyleDefault-block`.
 * So we use this behavior to create spacing between blocks by assign margin-bottom of which.
 * However, some block should not set spacing (e.g. block in <li> and <blockquote>), so we need to unset its margin-top.
 */

export const noSpacingBetweenContent = {
  blockquote: css`
    margin-bottom: unset;
  `,
  list: css`
    margin-bottom: 4px;
  `,
}

const draftEditorCssNormal = css`
  color: black;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji',
    'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
  font-weight: normal;
  .public-DraftStyleDefault-header-two {
    font-size: 36px;
    line-height: 1.5;
  }
  .public-DraftStyleDefault-header-three {
    font-size: 30px;
    line-height: 1.5;
  }
  .public-DraftStyleDefault-header-four {
  }

  .public-DraftStyleDefault-blockquote {
    color: rgba(97, 184, 198, 1);
    border-image: linear-gradient(
        to right,
        rgba(97, 184, 198, 1) 42.5%,
        transparent 42.5%,
        transparent 57.5%,
        rgba(97, 184, 198, 1) 57.5%
      )
      100% 1;
    &::before {
      background-color: rgba(97, 184, 198, 1);
    }
  }
`
const draftEditorCssWide = css`
  color: rgba(64, 64, 64, 0.87);
  font-family: 'Noto Serif TC', source-han-serif-tc, 'Songti TC', serif,
    PMingLiU;
  font-weight: 600;
  font-size: 18px;
  line-height: 2;
  [style*='font-weight:bold'] {
    font-weight: 900 !important;
  }
  .public-DraftStyleDefault-header-two {
    text-align: center;
    color: black;
    font-size: 36px;
    font-weight: 700;
  }
  .public-DraftStyleDefault-header-three {
    text-align: center;
    color: black;
    font-size: 32px;
    font-weight: 700;
  }
  .public-DraftStyleDefault-header-four {
  }
  .public-DraftStyleDefault-blockquote {
    color: rgba(0, 0, 0, 1);
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
      Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif,
      'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
      'Noto Color Emoji';
    font-weight: 400;

    border-image: linear-gradient(
        to right,
        rgba(0, 0, 0, 1) 42.5%,
        transparent 42.5%,
        transparent 57.5%,
        rgba(0, 0, 0, 1) 57.5%
      )
      100% 1;
    &::before {
      background-color: rgba(0, 0, 0, 1);
    }
  }
`
const draftEditorCssPremium = css`
  color: black;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji',
    'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
  font-weight: normal;
  .public-DraftStyleDefault-header-two {
    color: rgba(5, 79, 119, 1);
    font-weight: 500;
    text-align: center;
    font-size: 36px;
    line-height: 1.5;
  }
  .public-DraftStyleDefault-header-three {
    color: rgba(5, 79, 119, 1);
    text-align: center;
    font-weight: 500;
    font-size: 30px;
    line-height: 1.5;
  }
  .public-DraftStyleDefault-header-four {
  }

  .public-DraftStyleDefault-blockquote {
    color: rgba(5, 79, 119, 1);
    border-image: linear-gradient(
        to right,
        rgba(5, 79, 119, 1) 42.5%,
        transparent 42.5%,
        transparent 57.5%,
        rgba(5, 79, 119, 1) 57.5%
      )
      100% 1;
    &::before {
      background-color: rgba(5, 79, 119, 1);
    }
  }
`

//目前 Photography 文末樣式僅支援：H2, H3, 粗體、底線、斜體、超連結
//目前 photography 裡的 <figure> 都會被隱藏（因此 video、infobox、colorbox，就算在 CMS 裡上稿也都無法呈現 )
// Todo: 新增一個 util function 篩選出 Image
const draftEditorCssPhotography = css`
  color: white;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji',
    'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
  font-weight: normal;
  .public-DraftStyleDefault-header-two {
    font-weight: 500;
    text-align: center;
    font-size: 24px;
    line-height: 1.5;

    ${({ theme }) => theme.breakpoint.md} {
      font-size: 32px;
    }
  }
  .public-DraftStyleDefault-header-three {
    text-align: center;
    font-weight: 500;
    font-size: 18px;
    line-height: 1.5;

    ${({ theme }) => theme.breakpoint.md} {
      font-size: 24px;
    }
  }
`

const DraftEditorWrapper = styled.div<{ contentLayout: ContentLayout }>`
  width: 100%;
  height: 100%;
  border: 0;
  padding: 0px;
  font-size: 18px;
  line-height: ${draftEditorLineHeight};

  .public-DraftStyleDefault-block {
    ${defaultMarginBottom}
  }

  //last item in raw-content block should not have margin-bottom
  .public-DraftEditor-content {
    > div {
      > *:last-child {
        > *:last-child {
          margin-bottom: 0;
        }
      }
    }
  }

  /* Draft built-in buttons' style */

  .public-DraftStyleDefault-blockquote {
    position: relative;
    width: 100%;
    margin: 0 auto;
    max-width: 480px;
    text-align: left;
    margin: 48px auto;
    padding-top: 34px;
    border-top: 2px solid;
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 100%;
      height: 20px;
      mask-image: url(${blockquoteDecoration});
      mask-repeat: no-repeat;
      mask-position: center center;
    }
    ${noSpacingBetweenContent.blockquote}
    ${({ theme }) => theme.breakpoint.md} {
      padding-top: 26px;
    }
  }
  .public-DraftStyleDefault-ul {
    margin-left: 18px;
    list-style: none;
    ${defaultMarginBottom}
    .public-DraftStyleDefault-block {
      ${noSpacingBetweenContent.list}
    }
  }
  .public-DraftStyleDefault-unorderedListItem {
    position: relative;
    &::before {
      content: '';
      position: absolute;
      top: calc((1rem * ${draftEditorLineHeight}) / 2);
      left: -12px;
      width: 6px;
      height: 6px;
      transform: translateX(-50%);
      border-radius: 50%;
      background-color: #054f77;
    }
  }
  .public-DraftStyleDefault-ol {
    margin-left: 18px;
    ${defaultMarginBottom}
    .public-DraftStyleDefault-block {
      ${noSpacingBetweenContent.list}
    }
  }
  .public-DraftStyleDefault-orderedListItem {
    position: relative;
    counter-increment: list;
    padding-left: 6px;
    &::before {
      content: counter(list) '.';
      position: absolute;
      color: #054f77;
      left: -15px;
      width: auto;
    }
  }
  /* code-block */
  .public-DraftStyleDefault-pre {
  }

  ${({ contentLayout }) => {
    switch (contentLayout) {
      case 'normal':
        return draftEditorCssNormal
      case 'wide':
        return draftEditorCssWide
      case 'premium':
        return draftEditorCssPremium
      case 'photography':
        return draftEditorCssPhotography
      default:
        return draftEditorCssNormal
    }
  }}
  .alignCenter * {
    text-align: center;
  }
  .alignLeft * {
    text-align: left;
  }
`

const customStyleMap = {
  CODE: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
    fontSize: 16,
    padding: 2,
  },
}

const customStyleFn = (style) => {
  return style.reduce((styles, styleName) => {
    if (styleName?.startsWith(CUSTOM_STYLE_PREFIX_FONT_COLOR)) {
      styles['color'] = styleName.split(CUSTOM_STYLE_PREFIX_FONT_COLOR)[1]
    }
    if (styleName?.startsWith(CUSTOM_STYLE_PREFIX_BACKGROUND_COLOR)) {
      styles['backgroundColor'] = styleName.split(
        CUSTOM_STYLE_PREFIX_BACKGROUND_COLOR
      )[1]
    }
    return styles
  }, {})
}

const blockStyleFn = (editorState, block) => {
  const entityKey = block.getEntityAt(0)
  const entity = entityKey
    ? editorState.getCurrentContent().getEntity(entityKey)
    : null

  let result = ''
  const blockData = block.getData()
  if (blockData) {
    const textAlign = blockData?.get('textAlign')
    if (textAlign === 'center') {
      result += 'alignCenter '
    } else if (textAlign === 'left') {
      result += 'alignLeft '
    }
  }

  switch (block.getType()) {
    case 'header-two':
    case 'header-three':
    case 'header-four':
    case 'blockquote':
      result += 'public-DraftStyleDefault-' + block.getType()
      break
    case 'atomic':
      if (entity.getData()?.alignment) {
        // support all atomic block to set alignment
        result += ' ' + entity.getData().alignment
      }
      break
    default:
      break
  }
  return result
}
/**
 * TODO: add type of params `rawContentBlock`
 */
export default function DraftRenderer({
  rawContentBlock,
  contentLayout = 'normal',
  firstImageAdComponent,
}: {
  rawContentBlock: any
  contentLayout: ContentLayout
  firstImageAdComponent: ReactNode
}) {
  const contentState = convertFromRaw(rawContentBlock)
  const decorators = decoratorsGenerator(contentLayout)
  const editorState = EditorState.createWithContent(contentState, decorators)
  const blockRendererFn = (block) => {
    const atomicBlockObj = atomicBlockRenderer(
      block,
      contentLayout,
      firstImageAdComponent
    )
    return atomicBlockObj
  }
  return (
    <ThemeProvider theme={theme}>
      <DraftEditorWrapper contentLayout={contentLayout}>
        <Editor
          editorState={editorState}
          customStyleMap={customStyleMap}
          blockStyleFn={blockStyleFn.bind(null, editorState)}
          blockRendererFn={blockRendererFn}
          customStyleFn={customStyleFn}
          readOnly
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          onChange={() => {}}
        />
      </DraftEditorWrapper>
    </ThemeProvider>
  )
}
