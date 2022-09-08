import React from 'react'
import { EditorState } from 'draft-js'
import { RichTextEditor, buttonNames as bns } from './index'

export function BasicEditor(props: {
  onChange: (editorState: EditorState) => void
  editorState: EditorState
}) {
  return (
    <RichTextEditor
      onChange={props.onChange}
      editorState={props.editorState}
      disabledButtons={[
        bns.annotation,
        bns.divider,
        bns.embed,
        bns.image,
        bns.infoBox,
        bns.slideshow,
        bns.table,
      ]}
    />
  )
}
