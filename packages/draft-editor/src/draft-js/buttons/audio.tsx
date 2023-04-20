import React, { useState } from 'react'
import { AtomicBlockUtils, EditorState } from 'draft-js'

import {
  AudioSelector as DefaultAudioSelector,
  AudioEntityWithMeta,
} from './selector/audio-selector'

export function AudioButton(props: {
  editorState: EditorState
  onChange: (param: EditorState) => void
  className?: string
  AudioSelector: typeof DefaultAudioSelector
}) {
  const {
    editorState,
    onChange,
    className,
    AudioSelector = DefaultAudioSelector,
  } = props

  const [toShowAudioSelector, setToShowAudioSelector] = useState(false)

  const promptForAudioSelector = () => {
    setToShowAudioSelector(true)
  }

  const onAudioSelectorChange = (
    selectedAudiosWithMeta: AudioEntityWithMeta[]
  ) => {
    const audio = selectedAudiosWithMeta?.[0]?.audio
    if (!audio) {
      setToShowAudioSelector(false)
      return
    }

    const contentState = editorState.getCurrentContent()
    const contentStateWithEntity = contentState.createEntity(
      'AUDIO',
      'IMMUTABLE',
      {
        audio,
      }
    )
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey()
    const newEditorState = EditorState.set(editorState, {
      currentContent: contentStateWithEntity,
    })

    // The third parameter here is a space string, not an empty string
    // If you set an empty string, you will get an error: Unknown DraftEntity key: null
    onChange(AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, ' '))
    setToShowAudioSelector(false)
  }

  return (
    <React.Fragment>
      {toShowAudioSelector && (
        <AudioSelector onChange={onAudioSelectorChange} />
      )}

      <div className={className} onClick={promptForAudioSelector}>
        <i className="fa fa-file-audio"></i>
        <span> Audio</span>
      </div>
    </React.Fragment>
  )
}
