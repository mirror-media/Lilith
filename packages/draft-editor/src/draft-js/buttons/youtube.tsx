import React, { Fragment, useState, useEffect } from 'react'
import { AtomicBlockUtils, EditorState } from 'draft-js'
import { Drawer, DrawerController } from '@keystone-ui/modals'
import { TextInput } from '@keystone-ui/fields'
import styled, { createGlobalStyle } from 'styled-components'
import type { ButtonProps } from './type'

const Label = styled.label`
  display: block;
  font-weight: 600;
  margin: 10px 0;
`

// Global styles for Drawer on mobile devices
const DrawerMobileStyles = createGlobalStyle`
  @media (max-width: 767px) {
    /* Target all possible Drawer containers - emotion may generate different class names */
    div[role="dialog"][aria-modal="true"],
    form[role="dialog"][aria-modal="true"],
    [role="dialog"][aria-modal="true"] {
      width: 100vw !important;
      max-width: 100vw !important;
      min-width: 0 !important;
      left: 0 !important;
      right: 0 !important;
      margin-left: 0 !important;
      margin-right: 0 !important;
    }

    /* Ensure content doesn't overflow */
    [role="dialog"][aria-modal="true"] > * {
      max-width: 100% !important;
      box-sizing: border-box !important;
    }

    [role="dialog"][aria-modal="true"] * {
      max-width: 100% !important;
      box-sizing: border-box !important;
    }

    /* Input fields */
    [role="dialog"][aria-modal="true"] input {
      width: 100% !important;
      max-width: 100% !important;
    }
  }
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

  // Apply mobile styles dynamically when drawer is open
  // This ensures we override emotion's inline styles
  useEffect(() => {
    if (!isOpen) return

    const applyMobileStyles = () => {
      const drawer = document.querySelector(
        '[role="dialog"][aria-modal="true"]'
      ) as HTMLElement
      if (drawer && window.innerWidth <= 767) {
        // Use setProperty with important flag
        drawer.style.setProperty('width', '100vw', 'important')
        drawer.style.setProperty('max-width', '100vw', 'important')
        drawer.style.setProperty('min-width', '0', 'important')
        drawer.style.setProperty('left', '0', 'important')
        drawer.style.setProperty('right', '0', 'important')
        drawer.style.setProperty('margin', '0', 'important')
      }
    }

    // Apply immediately and after delays to ensure drawer is fully rendered
    applyMobileStyles()
    const timeout1 = setTimeout(applyMobileStyles, 10)
    const timeout2 = setTimeout(applyMobileStyles, 50)

    return () => {
      clearTimeout(timeout1)
      clearTimeout(timeout2)
    }
  }, [isOpen])

  return (
    <>
      <DrawerMobileStyles />
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
    </>
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
