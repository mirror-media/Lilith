import React from 'react'
import { AtomicBlockUtils, EditorState } from 'draft-js'
import styled from 'styled-components'

const Divider = styled.hr`
  box-sizing: border-box;
  border-width: 1px;
  border-style: inset;
`

const IconWrapper = styled.span`
  display: inline-block;
  position: relative;
  top: 2px;
`

export const DividerBlock = () => {
  return <Divider />
}

export function DividerButton(props) {
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
    <React.Fragment>
      <div onClick={onClick} className={className}>
        <IconWrapper>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="16"
            viewBox="0 0 16 16"
            width="16"
          >
            <g fill="none" fill-rule="evenodd">
              <path d="M0 0h16v16H0z" />
              <path
                d="M15 10.501a0.5 0.5 0 0 1 0.496 0.442l0.004 0.059v2.031a2.468 2.468 0 0 1 -2.361 2.466l-0.107 0.003H2.967a2.467 2.467 0 0 1 -2.465 -2.36L0.5 13.032v-2.03a0.5 0.5 0 0 1 0.997 -0.058l0.004 0.059v2.03a1.468 1.468 0 0 0 1.381 1.464l0.086 0.003h10.065a1.468 1.468 0 0 0 1.466 -1.382l0.003 -0.086v-2.031a0.5 0.5 0 0 1 0.5 -0.5zM15.5 7.5a0.5 0.5 0 0 1 0 1H0.5a0.5 0.5 0 0 1 0 -1zM13.029 0.5a2.471 2.471 0 0 1 2.469 2.364l0.003 0.107v2.031a0.5 0.5 0 0 1 -0.997 0.058L14.5 5.003V2.971a1.471 1.471 0 0 0 -1.385 -1.468L13.029 1.5H2.97a1.47 1.47 0 0 0 -1.467 1.383L1.5 2.97V5a0.5 0.5 0 0 1 -0.997 0.058L0.5 5V2.97a2.47 2.47 0 0 1 2.362 -2.467L2.97 0.5z"
                fill="#999"
                fill-rule="nonzero"
                stroke="#999"
                stoke-width="100"
                stroke-width="0.5"
              />
            </g>
          </svg>
        </IconWrapper>
      </div>
    </React.Fragment>
  )
}
