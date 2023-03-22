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
    padding: 25px 12px;
    text-align: right;
    margin: 40px auto 64px;
    position: relative;

    span {
      display: block;
      font-weight: 700;
      font-size: 20px;
      line-height: 1.5;
      text-align: justify;
      color: rgba(29, 29, 29, 0.87);
      margin: 16px 0;
    }

    &::before {
      content: '';
      width: 32px;
      height: 18px;
      position: absolute;
      top: 10px;
      left: 50%;
      transform: translate(0%, -16px);
      background-image: url("data:image/svg+xml,%3Csvg width='32' height='18' viewBox='0 0 32 18' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M32 5.21726C32 8.58715 30.835 11.5598 28.505 14.1357C26.175 16.7119 23.5196 18 20.5384 18C19.7651 18 19.1686 17.8368 18.7494 17.5108C18.3294 17.1845 18.12 16.609 18.12 15.7826C18.12 14.8042 18.3627 13.8696 18.8485 12.9783C20.3504 13.3262 21.7191 13.2666 22.9565 12.7989C24.193 12.3316 24.9216 10.9783 25.1429 8.73902C23.8619 8.41304 22.9396 7.88619 22.3768 7.15734C21.8137 6.42924 21.5319 5.5651 21.5319 4.56491C21.5319 3.1954 22.0173 2.09233 22.9894 1.25532C23.961 0.418692 25.2528 0 26.8653 0C28.5219 0 29.7914 0.434897 30.675 1.30432C31.5578 2.17411 32 3.47842 32 5.21726M13.8467 5.21726C13.8467 8.58715 12.6871 11.5598 10.3686 14.1357C8.0493 16.7119 5.38815 18 2.38512 18C1.63398 18 1.04861 17.8368 0.629396 17.5108C0.209416 17.1845 0 16.609 0 15.7826C0 14.8042 0.231621 13.8696 0.695245 12.9783C2.21935 13.3262 3.59414 13.2666 4.81962 12.7989C6.04549 12.3316 6.7683 10.9783 6.98958 8.73902C5.73079 8.41304 4.81962 7.88619 4.25646 7.15734C3.6933 6.42924 3.41191 5.5651 3.41191 4.56491C3.41191 3.1954 3.89735 2.09233 4.86939 1.25532C5.84105 0.418692 7.13277 0 8.74531 0C10.4015 0 11.6656 0.434897 12.5381 1.30432C13.4103 2.17411 13.8467 3.47842 13.8467 5.21726' fill='%23000928' fill-opacity='0.1'/%3E%3C/svg%3E%0A");
      background-repeat: no-repeat;
      background-position: center center;
    }

    ${({ theme }) => theme.breakpoint.md} {
      padding: 25px 0px;
      width: 480px;

      span {
        font-size: 24px;
      }
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
    color: red;
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

const customStyleFn = (style: any) => {
  return style.reduce((styles: any, styleName: string) => {
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

/* @ts-ignore */
export default function DraftRenderer({ rawContentBlock }) {
  const contentState = convertFromRaw(rawContentBlock)
  const editorState = EditorState.createWithContent(contentState, decorators)

  return (
    /* @ts-ignore */
    <ThemeProvider theme={theme}>
      <DraftEditorWrapper>
        <Editor
          editorState={editorState}
          customStyleMap={customStyleMap}
          blockStyleFn={blockStyleFn.bind(null, editorState)}
          blockRendererFn={blockRendererFn}
          customStyleFn={customStyleFn}
          readOnly
          onChange={() => {}}
        />
      </DraftEditorWrapper>
    </ThemeProvider>
  )
}
