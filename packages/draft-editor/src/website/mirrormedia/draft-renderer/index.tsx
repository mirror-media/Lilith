import React from 'react'
import { Editor, EditorState, convertFromRaw } from 'draft-js'
import decorators from '../draft-editor/entity-decorator'
import { atomicBlockRenderer } from '../draft-editor/block-redender-fn'

// to be separate
const styleMap = {
  CODE: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
    fontSize: 16,
    padding: 2,
  },
}
const blockRendererFn = (block) => {
  const atomicBlockObj = atomicBlockRenderer(block)
  return atomicBlockObj
}

const getBlockStyle = (block) => {
  switch (block.getType()) {
    case 'blockquote':
      return 'RichEditor-blockquote'

    default:
      return null
  }
}

export default function DraftRenderer({ rawContentBlock }) {
  const contentState = convertFromRaw(rawContentBlock)
  const editorState = EditorState.createWithContent(contentState, decorators)

  return (
    <Editor
      editorState={editorState}
      readOnly
      customStyleMap={styleMap}
      blockRendererFn={blockRendererFn}
      blockStyleFn={getBlockStyle}
    />
  )
}
