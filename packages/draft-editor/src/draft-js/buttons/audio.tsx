import React, { Fragment, useState } from 'react'
import { AtomicBlockUtils, EditorState } from 'draft-js'

import {
  AudioSelector as DefaultAudioSelector,
  AudioEntityWithMeta,
} from './selector/audio-selector'
import type { ButtonProps } from './type'

type AudioButtonProps<T> = Pick<
  ButtonProps,
  'editorState' | 'onChange' | 'className'
> & {
  AudioSelector?: typeof DefaultAudioSelector<T>
}

export function AudioButton<T>(props: AudioButtonProps<T>) {
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
    selectedAudiosWithMeta: AudioEntityWithMeta<T>[]
  ) => {
    const audio = selectedAudiosWithMeta?.[0]?.audio
    if (!audio) {
      setToShowAudioSelector(false)
      return
    }

    const contentState = editorState.getCurrentContent()

    // since 202310, only AUDIO-V2 will be created
    const contentStateWithEntity = contentState.createEntity(
      'AUDIO-V2',
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
    <Fragment>
      {toShowAudioSelector && (
        <AudioSelector onChange={onAudioSelectorChange} />
      )}

      <div className={className} onClick={promptForAudioSelector}>
        <i className="fa fa-file-audio"></i>
        <span> Audio</span>
      </div>
    </Fragment>
  )
}
