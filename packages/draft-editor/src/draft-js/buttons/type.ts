import type { EditorState } from 'draft-js'

export type ButtonProps = {
  editorState: EditorState
  onChange: (editorState: EditorState) => void
  className?: string
}
