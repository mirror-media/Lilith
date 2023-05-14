import {
  convertFromRaw,
  Editor,
  EditorState,
  RawDraftContentState,
} from 'draft-js'
import React from 'react'
import styled, { ThemeProvider } from 'styled-components'

import {
  CUSTOM_STYLE_PREFIX_BACKGROUND_COLOR,
  CUSTOM_STYLE_PREFIX_FONT_COLOR,
} from '../../draft-js/const'
import { atomicBlockRenderer } from './block-renderer-fn'
import decorators from './entity-decorator'
import {
  CitationStyle,
  NormalStyle,
  SummaryStyle,
} from './shared-style/content-type'
import {
  defaultH2Style,
  defaultOlStyle,
  defaultUlStyle,
  narrowSpacingBetweenContent,
  textAroundPictureStyle,
} from './shared-style/index'
import theme from './theme'
// eslint-disable-next-line prettier/prettier
import type { Post } from './types'
import { ValidPostContentType } from './types'
import { removeEmptyContentBlock } from './utils/common'
import { insertRecommendInContentBlock } from './utils/post'

type DraftEditorProps = {
  contentType: string
}

const DraftEditorWrapper = styled.div<DraftEditorProps>`
  /* Rich-editor default setting (.RichEditor-root)*/
  font-family: 'Georgia', serif;
  text-align: left;

  /* Custom setting */
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji',
    'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
  width: 100%;
  height: 100%;
  letter-spacing: 0.01em;
  color: rgba(0, 9, 40, 0.87);

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

  .public-DraftStyleDefault-ol {
    ${defaultOlStyle}
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

  ${({ contentType }) => {
    switch (contentType) {
      case ValidPostContentType.NORMAL:
      case ValidPostContentType.ACTIONLIST:
        return NormalStyle
      case ValidPostContentType.SUMMARY:
        return SummaryStyle
      case ValidPostContentType.CITATION:
        return CitationStyle
      default:
        return NormalStyle
    }
  }}
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
      ] = `linear-gradient(to top, transparent 25%, ${highlightColor} 25% 75%, transparent 75%)`
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
  contentType?: ValidPostContentType
}

export default function DraftRenderer({
  rawContentBlock,
  insertRecommend = [],
  contentType = ValidPostContentType.NORMAL,
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
    const contentWithRecommend = insertRecommendInContentBlock(
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
      <DraftEditorWrapper contentType={contentType}>
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
