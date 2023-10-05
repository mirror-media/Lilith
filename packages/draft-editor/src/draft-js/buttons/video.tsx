import React, { useState } from 'react'
import { AtomicBlockUtils, EditorState } from 'draft-js'

import {
  VideoSelector as DefaultVideoSelector,
  VideoEntityWithMeta,
} from './selector/video-selector'

export function VideoButton(props: {
  editorState: EditorState
  onChange: (param: EditorState) => void
  className?: string
  VideoSelector: typeof DefaultVideoSelector
}) {
  const {
    editorState,
    onChange,
    className,
    VideoSelector = DefaultVideoSelector,
  } = props

  const [toShowVideoSelector, setToShowVideoSelector] = useState(false)

  const promptForVideoSelector = () => {
    setToShowVideoSelector(true)
  }

  const onVideoSelectorChange = (
    selectedVideosWithMeta: VideoEntityWithMeta[]
  ) => {
    const video = selectedVideosWithMeta?.[0]?.video
    if (!video) {
      setToShowVideoSelector(false)
      return
    }

    const contentState = editorState.getCurrentContent()

    // since 202310, only VIDEO-V2 will be created
    const contentStateWithEntity = contentState.createEntity(
      'VIDEO-V2',
      'IMMUTABLE',
      {
        video,
      }
    )
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey()
    const newEditorState = EditorState.set(editorState, {
      currentContent: contentStateWithEntity,
    })

    // The third parameter here is a space string, not an empty string
    // If you set an empty string, you will get an error: Unknown DraftEntity key: null
    onChange(AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, ' '))
    setToShowVideoSelector(false)
  }

  return (
    <React.Fragment>
      {toShowVideoSelector && (
        <VideoSelector onChange={onVideoSelectorChange} />
      )}

      <div className={className} onClick={promptForVideoSelector}>
        <i className="fa fa-video-camera"></i>
        <span> Video</span>
      </div>
    </React.Fragment>
  )
}
