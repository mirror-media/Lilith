import React, { Fragment, useState } from 'react'
import { AtomicBlockUtils, EditorState } from 'draft-js'
import { Drawer, DrawerController } from '@keystone-ui/modals'
import { TextInput } from '@keystone-ui/fields'
import styled from 'styled-components'
import type { ButtonProps } from './type'

const Label = styled.label`
  display: block;
  font-weight: 600;
  margin: 10px 0;
`

type YoutubeInputType = {
  isOpen: boolean
  onChange: ({
    description,
    youtubeId,
  }: {
    description: string
    youtubeId: string
  }) => void
  onCancel: () => void
}

function getYoutubeId(urlOrId = '') {
  const youtubeIdRegex =
    /^(?:https?:\/\/(?:www\.)?youtube\.com\/watch\?v=|https?:\/\/youtu.be\/|\/id\/)?([a-zA-Z0-9_-]{11})/i

  const matches = urlOrId.startsWith('/')
    ? urlOrId.replace('/', '').match(youtubeIdRegex)
    : urlOrId.match(youtubeIdRegex)

  if (matches && matches[1]) {
    return matches[1]
  }

  return ''
}

export function YoutubeInput(props: YoutubeInputType) {
  const { isOpen, onChange, onCancel } = props

  const initialInputValue = {
    description: '',
    youtubeIdOrUrl: '',
  }

  const [inputValue, setInputValue] = useState(initialInputValue)

  const clearInputValue = () => {
    setInputValue(initialInputValue)
  }

  return (
    <DrawerController isOpen={isOpen}>
      <Drawer
        title={`Insert Youtube video`}
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
                description: inputValue.description,
                youtubeId: getYoutubeId(inputValue.youtubeIdOrUrl),
              })
              clearInputValue()
            },
          },
        }}
      >
        <Label htmlFor="description">Youtube Description</Label>
        <TextInput
          onChange={(e) =>
            setInputValue({
              description: e.target.value,
              youtubeIdOrUrl: inputValue.youtubeIdOrUrl,
            })
          }
          type="text"
          placeholder="description"
          id="description"
          value={inputValue.description}
        />
        <Label htmlFor="youtubeId">Youtube Video Id or Url</Label>
        <TextInput
          onChange={(e) =>
            setInputValue({
              description: inputValue.description,
              youtubeIdOrUrl: e.target.value,
            })
          }
          type="text"
          placeholder="youtubeId or url"
          id="youtubeIdOrUrl"
          value={inputValue.youtubeIdOrUrl}
        />
      </Drawer>
    </DrawerController>
  )
}

type YoutubeButtonProps = Pick<
  ButtonProps,
  'editorState' | 'onChange' | 'className'
>

export function YoutubeButton(props: YoutubeButtonProps) {
  const [toShowInput, setToShowInput] = useState(false)
  const { className, editorState, onChange: onEditorStateChange } = props

  const onChange = ({
    description,
    youtubeId,
  }: {
    description: string
    youtubeId: string
  }) => {
    const contentState = editorState.getCurrentContent()

    // create an InfoBox entity
    const contentStateWithEntity = contentState.createEntity(
      'YOUTUBE',
      'IMMUTABLE',
      {
        description,
        youtubeId,
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
      <YoutubeInput
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
          height="16px"
          width="14px"
          version="1.1"
          id="Layer_1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 461.001 461.001"
        >
          <path
            fill="#6b7280"
            d="M365.257,67.393H95.744C42.866,67.393,0,110.259,0,163.137v134.728
		c0,52.878,42.866,95.744,95.744,95.744h269.513c52.878,0,95.744-42.866,95.744-95.744V163.137
		C461.001,110.259,418.135,67.393,365.257,67.393z M300.506,237.056l-126.06,60.123c-3.359,1.602-7.239-0.847-7.239-4.568V168.607
		c0-3.774,3.982-6.22,7.348-4.514l126.06,63.881C304.363,229.873,304.298,235.248,300.506,237.056z"
          />
        </svg>
        <span>Youtube</span>
      </div>
    </Fragment>
  )
}
