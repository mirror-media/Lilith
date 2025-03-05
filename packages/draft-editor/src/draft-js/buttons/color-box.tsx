import React, { Fragment, useState, useEffect } from 'react'
import {
  AtomicBlockUtils,
  EditorState,
  RawDraftContentState,
  convertToRaw,
  convertFromRaw,
  CompositeDecorator,
} from 'draft-js'
import { Drawer, DrawerController } from '@keystone-ui/modals'
import { TextInput } from '@keystone-ui/fields'
import draftConverter from '../draft-converter'
import styled from 'styled-components'
import type { ButtonProps } from './type'

const Label = styled.label`
  display: block;
  font-weight: 600;
  margin: 10px 0;
`

const ColorHexInput = styled(TextInput)`
  margin-bottom: 10px;
`

export type RenderBasicEditor = (propsOfBasicEditor: {
  onChange: (es: EditorState) => void
  editorState: EditorState
}) => React.ReactElement

type ColorBoxInputType = {
  color?: string
  rawContentStateForColorBoxEditor?: RawDraftContentState
  isOpen: boolean
  onChange: ({
    color,
    rawContentState,
  }: {
    color: string
    rawContentState: RawDraftContentState
  }) => void
  onCancel: () => void
  renderBasicEditor: RenderBasicEditor
  decorators?: CompositeDecorator
}

export function ColorBoxInput(props: ColorBoxInputType) {
  const {
    isOpen,
    onChange,
    onCancel,
    color,
    rawContentStateForColorBoxEditor,
    renderBasicEditor,
    decorators,
  } = props
  const rawContentState = rawContentStateForColorBoxEditor || {
    blocks: [],
    entityMap: {},
  }
  const initialInputValue = {
    color: color || '',
    // create an `editorState` from raw content state object
    editorStateOfBasicEditor: EditorState.createWithContent(
      convertFromRaw(rawContentState),
      decorators
    ),
  }

  const [inputValue, setInputValue] = useState(initialInputValue)

  const clearInputValue = () => {
    setInputValue({
      color: '',
      editorStateOfBasicEditor: EditorState.createWithContent(
        convertFromRaw({
          blocks: [],
          entityMap: {},
        }),
        decorators
      ),
    })
  }

  useEffect(() => {
    if (isOpen) {
      setInputValue(initialInputValue)
    }
  }, [isOpen])

  const basicEditorJsx = renderBasicEditor({
    editorState: inputValue.editorStateOfBasicEditor,
    onChange: (editorStateOfBasicEditor: EditorState) => {
      setInputValue({
        color: inputValue.color,
        editorStateOfBasicEditor,
      })
    },
  })

  return (
    <DrawerController isOpen={isOpen}>
      <Drawer
        title={`Insert Color Box`}
        actions={{
          cancel: {
            label: 'Cancel',
            action: () => {
              clearInputValue()
              onCancel()
            },
          },
          confirm: {
            label: 'Confirm',
            action: () => {
              onChange({
                color: inputValue.color,
                // convert `contentState` of the `editorState` into raw content state object
                rawContentState: convertToRaw(
                  inputValue.editorStateOfBasicEditor.getCurrentContent()
                ),
              })
              clearInputValue()
            },
          },
        }}
      >
        <Label>Hex Color Code (#ffffff)</Label>
        <ColorHexInput
          onChange={(e) =>
            setInputValue({
              color: e.target.value,
              editorStateOfBasicEditor: inputValue.editorStateOfBasicEditor,
            })
          }
          type="text"
          placeholder="Color"
          value={inputValue.color}
        />
        <Label>內文</Label>
        {basicEditorJsx}
      </Drawer>
    </DrawerController>
  )
}

type ColorBoxButtonProps = Pick<
  ButtonProps,
  'editorState' | 'onChange' | 'className'
> & {
  renderBasicEditor: RenderBasicEditor
}

export function ColorBoxButton(props: ColorBoxButtonProps) {
  const [toShowInput, setToShowInput] = useState(false)
  const {
    className,
    editorState,
    onChange: onEditorStateChange,
    renderBasicEditor,
  } = props

  const onChange = ({
    color,
    rawContentState,
  }: {
    color: string
    rawContentState: RawDraftContentState
  }) => {
    const contentState = editorState.getCurrentContent()

    // create an ColorBox entity
    const contentStateWithEntity = contentState.createEntity(
      'COLORBOX',
      'IMMUTABLE',
      {
        color,
        rawContentState,
        body: draftConverter.convertToHtml(rawContentState),
      }
    )
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey()
    const newEditorState = EditorState.set(editorState, {
      currentContent: contentStateWithEntity,
    })

    //The third parameter here is a space string, not an empty string
    //If you set an empty string, you will get an error: Unknown DraftEntity key: null
    onEditorStateChange(
      AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, ' ')
    )
    setToShowInput(false)
  }

  return (
    <Fragment>
      <ColorBoxInput
        renderBasicEditor={renderBasicEditor}
        onChange={onChange}
        onCancel={() => {
          setToShowInput(false)
        }}
        isOpen={toShowInput}
      />
      <div
        className={className}
        onClick={() => {
          setToShowInput(true)
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14 0H2C0.895431 0 0 0.895431 0 2V14C0 15.1046 0.895431 16 2 16H14C15.1046 16 16 15.1046 16 14V2C16 0.895431 15.1046 0 14 0Z"
            fill="#6b7280"
          />
          <path
            d="M12.3867 2.66667H3.61332C3.36225 2.66667 3.12146 2.76641 2.94393 2.94394C2.76639 3.12148 2.66666 3.36227 2.66666 3.61334V5.51112C2.68312 5.75156 2.79025 5.97678 2.96639 6.14127C3.14253 6.30576 3.37454 6.39725 3.61555 6.39725C3.85655 6.39725 4.08856 6.30576 4.2647 6.14127C4.44084 5.97678 4.54797 5.75156 4.56443 5.51112V4.56445H6.94221V11.4356H5.99555C5.86547 11.4267 5.73496 11.4446 5.61211 11.4882C5.48926 11.5319 5.3767 11.6003 5.28141 11.6893C5.18612 11.7783 5.11015 11.8859 5.0582 12.0055C5.00626 12.1251 4.97946 12.2541 4.97946 12.3844C4.97946 12.5148 5.00626 12.6438 5.0582 12.7634C5.11015 12.883 5.18612 12.9906 5.28141 13.0796C5.3767 13.1686 5.48926 13.237 5.61211 13.2807C5.73496 13.3243 5.86547 13.3422 5.99555 13.3333H9.78666C10.0271 13.3169 10.2523 13.2097 10.4168 13.0336C10.5813 12.8575 10.6728 12.6255 10.6728 12.3844C10.6728 12.1434 10.5813 11.9114 10.4168 11.7353C10.2523 11.5592 10.0271 11.452 9.78666 11.4356H8.83999V4.56445H11.4355V5.51112C11.452 5.75156 11.5591 5.97678 11.7353 6.14127C11.9114 6.30576 12.1434 6.39725 12.3844 6.39725C12.6254 6.39725 12.8575 6.30576 13.0336 6.14127C13.2097 5.97678 13.3169 5.75156 13.3333 5.51112V3.61334C13.3333 3.36227 13.2336 3.12148 13.0561 2.94394C12.8785 2.76641 12.6377 2.66667 12.3867 2.66667Z"
            fill="white"
          />
        </svg>
        <span> ColorBox</span>
      </div>
    </Fragment>
  )
}
