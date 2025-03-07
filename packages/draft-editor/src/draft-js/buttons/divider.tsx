import React, { Fragment } from 'react'
import { AtomicBlockUtils, EditorState } from 'draft-js'
import styled from 'styled-components'
import type { ButtonProps } from './type'

const IconWrapper = styled.span`
  display: inline-block;
  position: relative;
  top: 2px;
`

type DividerButtonProps = Pick<
  ButtonProps,
  'editorState' | 'onChange' | 'className'
>

export function DividerButton(props: DividerButtonProps) {
  const { editorState, onChange, className } = props

  const onClick = () => {
    const contentState = editorState.getCurrentContent()
    const contentStateWithEntity = contentState.createEntity(
      'DIVIDER',
      'IMMUTABLE',
      {}
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
    <Fragment>
      <div onClick={onClick} className={className}>
        <IconWrapper>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="16"
            viewBox="0 0 16 16"
            width="16"
          >
            <g fill="none" fillRule="evenodd">
              <path d="M0 0h16v16H0z" />
              <path
                d="M15 10.501a0.5 0.5 0 0 1 0.496 0.442l0.004 0.059v2.031a2.468 2.468 0 0 1 -2.361 2.466l-0.107 0.003H2.967a2.467 2.467 0 0 1 -2.465 -2.36L0.5 13.032v-2.03a0.5 0.5 0 0 1 0.997 -0.058l0.004 0.059v2.03a1.468 1.468 0 0 0 1.381 1.464l0.086 0.003h10.065a1.468 1.468 0 0 0 1.466 -1.382l0.003 -0.086v-2.031a0.5 0.5 0 0 1 0.5 -0.5zM15.5 7.5a0.5 0.5 0 0 1 0 1H0.5a0.5 0.5 0 0 1 0 -1zM13.029 0.5a2.471 2.471 0 0 1 2.469 2.364l0.003 0.107v2.031a0.5 0.5 0 0 1 -0.997 0.058L14.5 5.003V2.971a1.471 1.471 0 0 0 -1.385 -1.468L13.029 1.5H2.97a1.47 1.47 0 0 0 -1.467 1.383L1.5 2.97V5a0.5 0.5 0 0 1 -0.997 0.058L0.5 5V2.97a2.47 2.47 0 0 1 2.362 -2.467L2.97 0.5z"
                fill="#6b7280"
                fillRule="nonzero"
                stroke="#6b7280"
                strokeWidth="0.5"
              />
            </g>
          </svg>
        </IconWrapper>
      </div>
    </Fragment>
  )
}
