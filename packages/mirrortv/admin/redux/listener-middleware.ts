import type { RootState, AppDispatch } from './store'
import { createListenerMiddleware, addListener } from '@reduxjs/toolkit'
import { isEqual } from 'lodash-es'
import { selectFiles } from './features/multi-images/selector'

export const listenerMiddleware = createListenerMiddleware()

export const startStoreListening = listenerMiddleware.startListening.withTypes<
  RootState,
  AppDispatch,
  undefined
>()

export const addStoreListener = addListener.withTypes<RootState, AppDispatch>()

/** revoke blob URL during related state changing to prevent memory leaks */
startStoreListening({
  predicate: (_, currentState, originalState) => {
    return (
      originalState.multiImages.files.length > 0 &&
      !isEqual(currentState.multiImages.files, originalState.multiImages.files)
    )
  },
  effect: (_, listenApi) => {
    console.log('// triggered //')
    const originalFiles = selectFiles(listenApi.getOriginalState())
    const currentFiles = selectFiles(listenApi.getState())
    const fileMap = new Map<string, string>(
      originalFiles.map(({ uid, blobURL }) => [uid, blobURL])
    )

    currentFiles.forEach(({ uid, blobURL }) => {
      const originalBlobURL = fileMap.get(uid)

      if (originalBlobURL && originalBlobURL === blobURL) {
        fileMap.delete(uid)
      }
    })

    for (const blobURL of fileMap.values()) {
      URL.revokeObjectURL(blobURL)
    }
  },
})
