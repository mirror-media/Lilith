import React, { useState } from 'react'
import { AlertDialog } from '@keystone-ui/modals'
import { AtomicBlockUtils, DraftEntityInstance, EditorState } from 'draft-js'
import { TextInput } from '@keystone-ui/fields'

const styles = {
  buttons: {
    marginBottom: 10,
    display: 'flex',
  },
  urlInputContainer: {
    marginBottom: 10,
  },
  urlInput: {
    fontFamily: "'Georgia', serif",
    marginRight: 10,
    padding: 3,
  },
  button: {
    marginTop: '10px',
    marginRight: '10px',
    cursor: 'pointer',
  },
  media: {
    width: '100%',
  },
}

const Audio = (props) => {
  return <audio controls src={props.src} style={styles.media} />
}

const Image = (props) => {
  return <img src={props.src} style={styles.media} />
}

const Video = (props) => {
  return <video controls src={props.src} style={styles.media} />
}

export const MediaBlock = (entity: DraftEntityInstance) => {
  const { src } = entity.getData()
  const type = entity.getType()

  let media
  if (type === 'audioLink') {
    media = <Audio src={src} />
  } else if (type === 'imageLink') {
    media = <Image src={src} />
  } else if (type === 'videoLink') {
    media = <Video src={src} />
  }

  return media
}

export function MediaButton(props) {
  const { editorState, onChange, customStyles } = props

  const [toShowUrlInput, setToShowUrlInput] = useState(false)
  const [urlValue, setUrlValue] = useState('')
  const [urlType, setUrlType] = useState('')

  const promptForMedia = (mediaType) => {
    setToShowUrlInput(true)
    setUrlValue('')
    setUrlType(mediaType)
  }

  const confirmMedia = () => {
    const contentState = editorState.getCurrentContent()
    const contentStateWithEntity = contentState.createEntity(
      urlType,
      'IMMUTABLE',
      { src: urlValue }
    )
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey()
    const newEditorState = EditorState.set(editorState, {
      currentContent: contentStateWithEntity,
    })

    // The third parameter here is a space string, not an empty string
    // If you set an empty string, you will get an error: Unknown DraftEntity key: null
    onChange(AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, ' '))

    setToShowUrlInput(false)
    setUrlType('')
  }

  const urlInput = (
    <AlertDialog
      title={`Insert ${urlType.toUpperCase()} LINK`}
      isOpen={toShowUrlInput}
      actions={{
        confirm: {
          label: 'Confirm',
          action: confirmMedia,
        },
        cancel: {
          label: 'Cancel',
          action: () => {
            setToShowUrlInput(false)
            setUrlValue('')
          },
        },
      }}
    >
      <TextInput
        onChange={(e) => setUrlValue(e.target.value)}
        style={styles.urlInput}
        type="text"
        value={urlValue}
      />
    </AlertDialog>
  )

  return (
    <React.Fragment>
      {urlInput}
      <div style={styles.buttons}>
        <div
          onClick={() => {
            promptForMedia('imageLink')
          }}
          style={customStyles || styles.button}
        >
          <i className="fas fa-arrow-up-right-from-square"></i>
          <span> Image Link</span>
        </div>
        <div
          onClick={() => {
            promptForMedia('audioLink')
          }}
          style={customStyles || styles.button}
        >
          <i className="far fa-file-audio"></i>
          <span> Audio Link</span>
        </div>
        <div
          onClick={() => {
            promptForMedia('videoLink')
          }}
          style={customStyles || styles.button}
        >
          <i className="far fa-file-video"></i>
          <span> Video Link</span>
        </div>
      </div>
    </React.Fragment>
  )
}
