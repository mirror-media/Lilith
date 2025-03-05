import React from 'react'
import { AtomicBlockUtils, EditorState, RawDraftContentState } from 'draft-js'
import type { ButtonProps } from './type'

type TableButtonProps = Pick<
  ButtonProps,
  'editorState' | 'onChange' | 'className'
>

export function TableButton(props: TableButtonProps) {
  const { editorState, onChange, className } = props

  const onClick = () => {
    const rawDarftContentState: RawDraftContentState = {
      blocks: [],
      entityMap: {},
    }
    const contentState = editorState.getCurrentContent()
    const contentStateWithEntity = contentState.createEntity(
      'TABLE',
      'IMMUTABLE',
      {
        // `tableStyles` is to used to store custom React CSS inline styles.
        // Therefore, please make sure the style name needs to be camelCase.
        tableStyles: {
          // We can customize the inline styles of each row.
          rows: [
            // thead has different background color.
            { backgroundColor: '#f2f2f2' },
            {},
            {},
          ],

          // TODO: add column styles and cell styles if needed
          columns: [],
          cells: [],
        },
        // We use two dimensions array to store the data.
        // The items of the array represent the rows,
        // and each item is also an array, which represents the columns.
        // Take the following array as example.
        // It is a
        // row: 3
        // column: 2
        // sheet data stored in a 2 dimensions arrary.
        tableData: [
          [rawDarftContentState, rawDarftContentState],
          [rawDarftContentState, rawDarftContentState],
          [rawDarftContentState, rawDarftContentState],
        ],
      }
    )
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey()
    const newEditorState = EditorState.set(editorState, {
      currentContent: contentStateWithEntity,
    })

    // The third parameter here is a space string, not an empty string
    // If you set an empty string, you will get an error: Unknown DraftEntity key: null
    onChange(AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, ' '))
  }

  return (
    <div onClick={onClick} className={className}>
      <i className="fa fa-table"></i>
      <span>Table</span>
    </div>
  )
}
