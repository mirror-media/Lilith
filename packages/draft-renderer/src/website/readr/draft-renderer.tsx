import {
  convertFromRaw,
  Editor,
  EditorState,
  RawDraftContentState,
} from 'draft-js'
import React from 'react'
import styled, { css, ThemeProvider } from 'styled-components'

import {
  CUSTOM_STYLE_PREFIX_BACKGROUND_COLOR,
  CUSTOM_STYLE_PREFIX_FONT_COLOR,
} from '../../draft-js/const'
import { atomicBlockRenderer } from './block-renderer-fn'
import decorators from './entity-decorator'
import {
  defaultBlockQuoteStyle,
  defaultH2Style,
  defaultOlStyle,
  defaultSpacingBetweenContent,
  defaultUlStyle,
  narrowSpacingBetweenContent,
  noSpacingBetweenContent,
} from './shared-style'
import theme from './theme'
// eslint-disable-next-line prettier/prettier
import type { Post } from './types'
import { insertRecommendInContent, removeEmptyContentBlock } from './utils'

const blockQuoteSpacingBetweenContent = css`
  .public-DraftStyleDefault-block {
    margin-top: 8px;
  }
`
const textAroundPictureStyle = css`
  max-width: 33.3%;
  > figure {
    margin-bottom: 0;
    width: 150%;
    transform: unset;
  }
  figcaption {
    padding: 0;
  }
`

const DraftEditorWrapper = styled.div`
  /* Rich-editor default setting (.RichEditor-root)*/
  font-family: 'Georgia', serif;
  text-align: left;

  /* Custom setting */
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji',
    'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
  width: 100%;
  height: 100%;
  ${({ theme }) => theme.fontSize.md};
  line-height: 2;
  letter-spacing: 0.01em;
  color: rgba(0, 9, 40, 0.87);
  *:not(:first-child) {
    ${defaultSpacingBetweenContent}
  }

  *:has(.bg) + *:has(.bg) {
    section {
      margin-top: 0 !important;
    }
  }

  /* Draft built-in buttons' style */
  .public-DraftStyleDefault-header-two {
    ${defaultH2Style}

    & + * {
      ${narrowSpacingBetweenContent}
    }
  }

  .public-DraftStyleDefault-ul {
    ${defaultUlStyle}
  }

  .public-DraftStyleDefault-unorderedListItem {
    ${noSpacingBetweenContent};
  }

  .public-DraftStyleDefault-ol {
    ${defaultOlStyle}
  }
  .public-DraftStyleDefault-orderedListItem {
    ${noSpacingBetweenContent};
  }

  .public-DraftStyleDefault-blockquote {
    ${defaultBlockQuoteStyle};

    & + blockquote {
      ${blockQuoteSpacingBetweenContent};
    }
  }

  /* code-block */
  .public-DraftStyleDefault-pre {
    overflow: hidden;
  }

  .alignCenter * {
    text-align: center;
  }
  .alignLeft * {
    text-align: left;
  }

  /* image-block: text-around-picture */
  figure.left {
    ${({ theme }) => theme.breakpoint.xl} {
      ${textAroundPictureStyle};
      float: left;
      transform: translateX(calc(-50% - 32px));
    }
  }

  figure.right {
    ${({ theme }) => theme.breakpoint.xl} {
      ${textAroundPictureStyle};
      float: right;
      transform: translateX(32px);
    }
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

const customStyleFn = (style: any) => {
  return style.reduce((styles: any, styleName: string) => {
    if (styleName?.startsWith(CUSTOM_STYLE_PREFIX_FONT_COLOR)) {
      styles['color'] = styleName.split(CUSTOM_STYLE_PREFIX_FONT_COLOR)[1]
    }
    if (styleName?.startsWith(CUSTOM_STYLE_PREFIX_BACKGROUND_COLOR)) {
      const highlightColor = styleName.split(
        CUSTOM_STYLE_PREFIX_BACKGROUND_COLOR
      )[1]
      styles[
        'background'
      ] = `linear-gradient(to top, transparent 25%, ${highlightColor} 25% 65%, transparent 65%)`
    }
    return styles
  }, {})
}

const blockStyleFn = (editorState: any, block: any) => {
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

const blockRendererFn = (block: any) => {
  const atomicBlockObj = atomicBlockRenderer(block)
  return atomicBlockObj
}

type DraftRendererProps = {
  rawContentBlock?: RawDraftContentState
  insertRecommend?: Post[]
}

export default function DraftRenderer({
  rawContentBlock,
  insertRecommend = [],
}: DraftRendererProps) {

  //if `rawContentBlock` has no data, throw error
  if (
    !rawContentBlock ||
    !rawContentBlock.blocks ||
    !rawContentBlock.blocks.length
  ) {
    throw new Error(
      'There is no content in rawContentBlock, please check again.'
    )
  }

  let contentState

  //if `rawContentBlock` data need to insert recommends, use `insertRecommendInContent` utils 
  if (insertRecommend.length) {
    const contentWithRecommend = insertRecommendInContent(
      rawContentBlock,
      insertRecommend
    )
    contentState = convertFromRaw(contentWithRecommend)
  } else {
  
  //if `rawContentBlock` data has no recommends, only remove empty content blocks
    const contentRemoveEmpty = removeEmptyContentBlock(rawContentBlock)
    contentState = convertFromRaw(contentRemoveEmpty)
  }

  const editorState = EditorState.createWithContent(contentState, decorators)

  return (
    <ThemeProvider theme={theme}>
      <DraftEditorWrapper>
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
