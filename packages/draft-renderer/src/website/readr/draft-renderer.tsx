import { convertFromRaw, Editor, EditorState } from 'draft-js'
import React from 'react'
import styled, { ThemeProvider } from 'styled-components'

import {
  CUSTOM_STYLE_PREFIX_BACKGROUND_COLOR,
  CUSTOM_STYLE_PREFIX_FONT_COLOR,
} from '../../draft-js/const'
import { atomicBlockRenderer } from './block-renderer-fn'
import decorators from './entity-decorator'
import theme from './theme'

const DraftEditorWrapper = styled.div`
  /* Rich-editor default setting (.RichEditor-root)*/
  background: #fff;
  font-family: 'Georgia', serif;
  font-size: 14px;

  /* Custom setting */
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji',
    'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
  width: 100%;
  height: 100%;
  background: rgb(255, 255, 255);

  .DraftEditor-root {
    font-size: 18px;
    line-height: 2;
    letter-spacing: 0.01em;
    color: rgba(0, 9, 40, 0.87);
  }

  div[data-block='true'] + * {
    margin: 32px 0 0;
  }

  /* Draft built-in buttons' style */
  .public-DraftStyleDefault-header-two {
    font-size: 24px;
    font-weight: 700;
    line-height: 1.5;
    letter-spacing: 0.032em;
    color: #000928;
    margin: 32px 0 0;

    & + * {
      margin: 16px 0 0;
    }

    ${({ theme }) => theme.breakpoint.md} {
      font-size: 28px;
    }
  }

  .public-DraftStyleDefault-blockquote {
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
  .public-DraftStyleDefault-ul {
    list-style-type: disc;
    margin-top: 0;
    padding-left: 1.2rem;

    & + * {
      margin: 32px 0 0;
    }
  }
  .public-DraftStyleDefault-unorderedListItem {
    font-size: 18px;
    line-height: 2;
    letter-spacing: 0.01em;
    text-align: justify;
    color: rgba(0, 9, 40, 0.87);
  }
  .public-DraftStyleDefault-ol {
    list-style-type: decimal;
    margin-top: 0;
    padding-left: 1.2rem;

    & + * {
      margin: 32px 0 0;
    }
  }
  .public-DraftStyleDefault-orderedListItem {
    font-size: 18px;
    line-height: 2;
    letter-spacing: 0.01em;
    text-align: justify;
    color: rgba(0, 9, 40, 0.87);
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
