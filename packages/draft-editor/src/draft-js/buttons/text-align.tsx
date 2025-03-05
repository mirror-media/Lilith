import React, { Fragment } from 'react'
import { EditorState } from 'draft-js'
import { Modifier } from '../modifier'
import type { ButtonProps } from './type'
import type { Map } from 'immutable'

const toggleSelectionTextAlign = (
  editorState: EditorState,
  textAlign: string
) => {
  return setSelectionBlockData(editorState, {
    textAlign:
      getSelectionBlockData(editorState, 'textAlign') !== textAlign
        ? textAlign
        : undefined,
  } as unknown as Map<any, any>)
}

const setSelectionBlockData = (
  editorState: EditorState,
  blockData: Map<any, any>
) => {
  return Modifier.setBlockData(
    editorState.getCurrentContent(),
    editorState.getSelection(),
    blockData
  )
}

export const getSelectionBlockData = (
  editorState: EditorState,
  name: string
) => {
  const block = editorState
    .getCurrentContent()
    .getBlockForKey(editorState.getSelection().getAnchorKey())
  const blockData = block.getData()
  return blockData.get(name)
}

type AlignCenterButtonProps = Pick<
  ButtonProps,
  'editorState' | 'onChange' | 'className'
> & {
  isActive?: boolean
}

export function AlignCenterButton(props: AlignCenterButtonProps) {
  const { isActive, editorState, onChange, className } = props

  const toggleTextAlign = () => {
    const newContentState = toggleSelectionTextAlign(editorState, 'center')
    onChange(
      // @ts-ignore `change-block-style` is not EditoChangeType
      EditorState.push(editorState, newContentState, 'change-block-style')
    )
  }

  return (
    <Fragment>
      <div className={className} onMouseDown={toggleTextAlign}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M11.4286 2.28571H4.57143C3.93929 2.28571 3.42857 1.77393 3.42857 1.14286C3.42857 0.511786 3.93929 0 4.57143 0H11.4286C12.0607 0 12.5714 0.511786 12.5714 1.14286C12.5714 1.77393 12.0607 2.28571 11.4286 2.28571ZM14.8571 6.85714H1.14286C0.511786 6.85714 0 6.34643 0 5.71429C0 5.08214 0.511786 4.57143 1.14286 4.57143H14.8571C15.4893 4.57143 16 5.08214 16 5.71429C16 6.34643 15.4893 6.85714 14.8571 6.85714ZM0 14.8571C0 14.225 0.511786 13.7143 1.14286 13.7143H14.8571C15.4893 13.7143 16 14.225 16 14.8571C16 15.4893 15.4893 16 14.8571 16H1.14286C0.511786 16 0 15.4893 0 14.8571ZM11.4286 11.4286H4.57143C3.93929 11.4286 3.42857 10.9179 3.42857 10.2857C3.42857 9.65357 3.93929 9.14286 4.57143 9.14286H11.4286C12.0607 9.14286 12.5714 9.65357 12.5714 10.2857C12.5714 10.9179 12.0607 11.4286 11.4286 11.4286Z"
            fill={isActive ? '#ED8B00' : '#6b7280'}
          />
        </svg>
      </div>
    </Fragment>
  )
}

type AlignLeftButtonProps = Pick<
  ButtonProps,
  'editorState' | 'onChange' | 'className'
> & {
  isActive?: boolean
}

export function AlignLeftButton(props: AlignLeftButtonProps) {
  const { isActive, editorState, onChange, className } = props

  const toggleTextAlign = () => {
    const newContentState = toggleSelectionTextAlign(editorState, 'left')
    onChange(
      // @ts-ignore `change-block-style` is not EditoChangeType
      EditorState.push(editorState, newContentState, 'change-block-style')
    )
  }

  return (
    <Fragment>
      <div className={className} onMouseDown={toggleTextAlign}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9.14286 2.28571H1.14286C0.511786 2.28571 0 1.77393 0 1.14286C0 0.511786 0.511786 0 1.14286 0H9.14286C9.775 0 10.2857 0.511786 10.2857 1.14286C10.2857 1.77393 9.775 2.28571 9.14286 2.28571ZM9.14286 11.4286H1.14286C0.511786 11.4286 0 10.9179 0 10.2857C0 9.65357 0.511786 9.14286 1.14286 9.14286H9.14286C9.775 9.14286 10.2857 9.65357 10.2857 10.2857C10.2857 10.9179 9.775 11.4286 9.14286 11.4286ZM0 5.71429C0 5.08214 0.511786 4.57143 1.14286 4.57143H14.8571C15.4893 4.57143 16 5.08214 16 5.71429C16 6.34643 15.4893 6.85714 14.8571 6.85714H1.14286C0.511786 6.85714 0 6.34643 0 5.71429ZM14.8571 16H1.14286C0.511786 16 0 15.4893 0 14.8571C0 14.225 0.511786 13.7143 1.14286 13.7143H14.8571C15.4893 13.7143 16 14.225 16 14.8571C16 15.4893 15.4893 16 14.8571 16Z"
            fill={isActive ? '#ED8B00' : '#6b7280'}
          />
        </svg>
      </div>
    </Fragment>
  )
}
