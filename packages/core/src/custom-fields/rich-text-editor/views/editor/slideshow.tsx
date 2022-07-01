import React, { useState } from 'react'
import { ImageSelector, ImageEntityWithDesc } from './image'
import { AtomicBlockUtils, DraftEntityInstance, EditorState } from 'draft-js'

const styles = {
  image: {
    width: '100%',
  },
  slideshow: {
    moreBt: {
      position: 'absolute' as const,
      top: '50%',
      left: '50%',
      borderRadius: '100%',
      border: 'black 1px solid',
      transform: 'translate(-50%, -50%)',
      padding: '10px',
      backgroundColor: 'white',
    },
  },
  buttons: {
    marginBottom: 10,
    display: 'flex',
  },
  button: {
    marginTop: '10px',
    marginRight: '10px',
    cursor: 'pointer',
  },
}

export function SlideshowBlock(entity: DraftEntityInstance) {
  const images = entity.getData()
  return (
    <figure style={{ position: 'relative' }}>
      <img
        src={images?.[0]?.resized?.original}
        style={styles.image}
        onError={(e) => (e.currentTarget.src = images?.[0]?.imageFile?.url)}
      />
      <div style={styles.slideshow.moreBt}>+{images.length}</div>
    </figure>
  )
}

export function SlideshowButton(props: {
  editorState: EditorState
  onChange: (param: EditorState) => void
  className?: string
}) {
  const { editorState, onChange, className } = props

  const [toShowImageSelector, setToShowImageSelector] = useState(false)

  const promptForImageSelector = () => {
    setToShowImageSelector(true)
  }

  const onImageSelectorChange = (selected: ImageEntityWithDesc[]) => {
    if (selected.length === 0) {
      setToShowImageSelector(false)
      return
    }

    const contentState = editorState.getCurrentContent()
    const contentStateWithEntity = contentState.createEntity(
      'slideshow',
      'IMMUTABLE',
      selected.map((ele) => {
        return {
          ...ele?.image,
          desc: ele?.desc,
        }
      })
    )
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey()
    const newEditorState = EditorState.set(editorState, {
      currentContent: contentStateWithEntity,
    })

    // The third parameter here is a space string, not an empty string
    // If you set an empty string, you will get an error: Unknown DraftEntity key: null
    onChange(AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, ' '))
    setToShowImageSelector(false)
  }

  return (
    <React.Fragment>
      <ImageSelector
        isOpen={toShowImageSelector}
        onChange={onImageSelectorChange}
        enableMultipleSelect={true}
      />
      <div className={className} onClick={promptForImageSelector}>
        <i className="far fa-images"></i>
        <span> Slideshow</span>
      </div>
    </React.Fragment>
  )
}
