import React, { useState } from 'react'
import { AtomicBlockUtils, EditorState } from 'draft-js'
import {
  PostSelector as DefaultPostSelector,
  PostEntityWithMeta,
} from './selector/post-selector'

type RelatedPostButtonProps = {
  className: string
  editorState: EditorState
  onChange: ({ editorState }: { editorState: EditorState }) => void
  PostSelector: typeof DefaultPostSelector
}

export function RelatedPostButton(props: RelatedPostButtonProps) {
  const {
    editorState,
    onChange,
    className,
    PostSelector = DefaultPostSelector,
  } = props

  const [toShowPostSelector, setToShowPostSelector] = useState(false)

  const promptForPostSelector = () => {
    setToShowPostSelector(true)
  }

  const onPostSelectorChange = (selected: PostEntityWithMeta[]) => {
    if (!selected.length) {
      setToShowPostSelector(false)
      return
    }

    const contentState = editorState.getCurrentContent()
    const contentStateWithEntity = contentState.createEntity(
      'RELATEDPOST',
      'IMMUTABLE',
      {
        posts: selected.map((ele) => ele.post),
      }
    )
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey()
    const newEditorState = EditorState.set(editorState, {
      currentContent: contentStateWithEntity,
    })

    // The third parameter here is a space string, not an empty string
    // If you set an empty string, you will get an error: Unknown DraftEntity key: null
    onChange(AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, ' '))
    setToShowPostSelector(false)
  }

  return (
    <React.Fragment>
      {toShowPostSelector && (
        <PostSelector
          onChange={onPostSelectorChange}
          enableMultiSelect={true}
          minSelectCount={1}
          maxSelectCount={3}
        />
      )}
      <div className={className} onClick={promptForPostSelector}>
        <svg
          width="16"
          height="14"
          viewBox="0 0 16 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14.675 0H10.7917C9.45556 0 8.29445 1.11291 8.00278 2.6837C7.70833 1.11291 6.55 0 5.21389 0H1.33333C0.597222 0 0 0.718549 0 1.6042V9.81905C0 10.7047 0.597222 11.4233 1.33333 11.4233H3.825C6.66389 11.4233 7.51111 12.2387 7.91667 13.9298C7.93611 14.0234 8.06111 14.0234 8.08333 13.9298C8.49167 12.2387 9.33889 11.4233 12.175 11.4233H14.6667C15.4028 11.4233 16 10.7047 16 9.81905V1.60754C16 0.725233 15.4083 0.00668417 14.675 0ZM6.72222 8.8699C6.72222 8.9334 6.68056 8.98687 6.625 8.98687H2.17222C2.11944 8.98687 2.075 8.93674 2.075 8.8699V8.10456C2.075 8.04106 2.11667 7.98759 2.17222 7.98759H6.62778C6.68056 7.98759 6.725 8.03772 6.725 8.10456V8.8699H6.72222ZM6.72222 6.83457C6.72222 6.89807 6.68056 6.95154 6.625 6.95154H2.17222C2.11944 6.95154 2.075 6.90141 2.075 6.83457V6.06923C2.075 6.00573 2.11667 5.95226 2.17222 5.95226H6.62778C6.68056 5.95226 6.725 6.00239 6.725 6.06923V6.83457H6.72222ZM6.72222 4.79924C6.72222 4.86274 6.68056 4.91621 6.625 4.91621H2.17222C2.11944 4.91621 2.075 4.86608 2.075 4.79924V4.0339C2.075 3.9704 2.11667 3.91693 2.17222 3.91693H6.62778C6.68056 3.91693 6.725 3.96706 6.725 4.0339V4.79924H6.72222ZM13.925 8.86656C13.925 8.93005 13.8833 8.98353 13.8278 8.98353H9.375C9.32222 8.98353 9.27778 8.9334 9.27778 8.86656V8.10122C9.27778 8.03772 9.31944 7.98424 9.375 7.98424H13.8306C13.8833 7.98424 13.9278 8.03438 13.9278 8.10122V8.86656H13.925ZM13.925 6.83122C13.925 6.89472 13.8833 6.9482 13.8278 6.9482H9.375C9.32222 6.9482 9.27778 6.89807 9.27778 6.83122V6.06589C9.27778 6.00239 9.31944 5.94891 9.375 5.94891H13.8306C13.8833 5.94891 13.9278 5.99905 13.9278 6.06589V6.83122H13.925ZM13.925 4.79589C13.925 4.85939 13.8833 4.91287 13.8278 4.91287H9.375C9.32222 4.91287 9.27778 4.86274 9.27778 4.79589V4.0339C9.27778 3.9704 9.31944 3.91693 9.375 3.91693H13.8306C13.8833 3.91693 13.9278 3.96706 13.9278 4.0339V4.79589H13.925Z"
            fill="#6b7280"
          />
        </svg>
        <span>Related Post</span>
      </div>
    </React.Fragment>
  )
}
