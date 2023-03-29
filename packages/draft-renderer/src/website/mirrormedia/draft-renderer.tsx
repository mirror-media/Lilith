import React from 'react'
import styled, { ThemeProvider } from 'styled-components'

import { Editor, EditorState, convertFromRaw } from 'draft-js'
import blockquoteDecoration from './assets/blockquote-decoration.png'
import { atomicBlockRenderer } from './block-renderer-fn'
import decorators from './entity-decorator'
import {
  CUSTOM_STYLE_PREFIX_FONT_COLOR,
  CUSTOM_STYLE_PREFIX_BACKGROUND_COLOR,
} from '../../draft-js/const'
import theme from './theme'

const draftEditorLineHeight = 2
const DraftEditorWrapper = styled.div`
  /* Rich-editor default setting (.RichEditor-root)*/

  border: 1px solid #ddd;
  font-family: 'Georgia', serif;
  font-size: 14px;
  padding: 15px;

  /* Custom setting */
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji',
    'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
  width: 100%;
  height: 100%;
  border-radius: 6px;
  border: 0;
  padding: 0px;
  font-size: 18px;
  line-height: ${draftEditorLineHeight};

  /* Draft built-in buttons' style */
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
    position: relative;
    width: 100%;
    margin: 0 auto;
    max-width: 480px;
    text-align: left;
    color: rgba(97, 184, 198, 1);
    margin: 48px auto;
    padding-top: 34px;
    border-top: 2px solid;
    border-image: linear-gradient(
        to right,
        rgba(97, 184, 198, 1) 42.5%,
        transparent 42.5%,
        transparent 57.5%,
        rgba(97, 184, 198, 1) 57.5%
      )
      100% 1;
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 100%;
      height: 20px;
      background-image: url(${blockquoteDecoration});
      background-repeat: no-repeat;
      background-position: center center;
    }

    ${({ theme }) => theme.breakpoint.md} {
      padding-top: 26px;
    }
  }
  .public-DraftStyleDefault-ul {
    margin-left: 18px;
    list-style: none;
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
      width: 15px;
    }
  }
  /* code-block */
  .public-DraftStyleDefault-pre {
  }
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

const blockRendererFn = (block) => {
  const atomicBlockObj = atomicBlockRenderer(block)
  return atomicBlockObj
}

export default function DraftRenderer({ rawContentBlock }) {
  const contentState = convertFromRaw(rawContentBlock)
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
        />
      </DraftEditorWrapper>
    </ThemeProvider>
  )
}
