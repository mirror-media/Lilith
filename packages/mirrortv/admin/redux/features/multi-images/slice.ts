import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from '@reduxjs/toolkit'
import { sha256 } from 'js-sha256'
import { convertBlobToString, isImageFile } from '../../../utils'
import { sortBy } from 'lodash-es'

type ImageFileData = {
  uid: string
  originalName: string
  name: string
  blobURL: string
  type: string
  isSelected: boolean
  shouldSetWatermark: boolean
}

type MutilImageState = {
  files: ImageFileData[]
  shouldSetWatermarkToAll: boolean
}

const initialState: MutilImageState = {
  files: [],
  shouldSetWatermarkToAll: true,
}

type RawImageFileData = Pick<ImageFileData, 'uid' | 'name' | 'blobURL' | 'type'>

export const addImageFiles = createAsyncThunk(
  'multiImages/addImageFiles',
  async (files: File[]): Promise<RawImageFileData[]> => {
    const tasks = files.map(
      async (file): Promise<RawImageFileData | undefined> => {
        if (isImageFile(file)) {
          /** @see https://medium.com/@Saf_Bes/get-current-date-in-format-yyyy-mm-dd-with-javascript-9c898d1d5b22 */
          const fileNamePostfix = new Intl.DateTimeFormat('fr-CA', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          }).format(Date.now())

          const uInt8Data = await file.arrayBuffer()
          const name = file.name
          const positionOfLastDot = name.lastIndexOf('.')
          let filename: string
          if (positionOfLastDot > -1) {
            filename = [
              name.slice(0, positionOfLastDot),
              '_',
              fileNamePostfix,
              name.slice(positionOfLastDot),
            ].join('')
          } else {
            filename = [name, '_', fileNamePostfix].join('')
          }

          return {
            uid: sha256(uInt8Data),
            name: filename,
            type: file.type,
            blobURL: convertBlobToString(file),
          }
        }
      }
    )

    return (await Promise.allSettled(tasks))
      .filter(
        (
          promiseResult
        ): promiseResult is PromiseFulfilledResult<
          RawImageFileData | undefined
        > => promiseResult.status === 'fulfilled'
      )
      .map((fulfilledResult) => fulfilledResult.value)
      .filter((result): result is RawImageFileData => Boolean(result))
  }
)

export const multiImagesSlice = createSlice({
  name: 'multiImages',
  initialState,
  reducers: {
    setShouldSetWatermarkByUid: (state, action: PayloadAction<string>) => {
      state.files = state.files.map((file) => {
        const uid = action.payload
        if (file.uid === uid) {
          return {
            ...file,
            shouldSetWatermark: !file.shouldSetWatermark,
          }
        }
        return file
      })
    },
    setShouldSetWatermarkToAll: (state) => {
      const shouldSetWatermark = !state.shouldSetWatermarkToAll
      state.shouldSetWatermarkToAll = shouldSetWatermark
      state.files = state.files.map((file) => ({
        ...file,
        shouldSetWatermark: shouldSetWatermark,
      }))
    },
    setIsSelected: (state, action: PayloadAction<string>) => {
      state.files = state.files.map((file) => {
        const uid = action.payload
        if (file.uid === uid) {
          return {
            ...file,
            isSelected: !file.isSelected,
          }
        }
        return file
      })
    },
    removeSelectedItems: (state) => {
      state.files = state.files.filter((file) => file.isSelected === false)
    },
    resetAllState: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(addImageFiles.fulfilled, (state, action) => {
      const existedUids = new Set<string>(state.files.map((data) => data.uid))
      const newItems: ImageFileData[] = []

      action.payload.forEach((data) => {
        const uid = data.uid
        if (existedUids.has(uid) === false) {
          existedUids.add(uid)
          newItems.push({
            ...data,
            originalName: data.name,
            isSelected: false,
            shouldSetWatermark: true,
          })
        }
      })

      state.files = sortBy([...state.files, ...newItems], ['originalName'])
    })
  },
})

export const {
  setShouldSetWatermarkByUid,
  setShouldSetWatermarkToAll,
  setIsSelected,
  removeSelectedItems,
  resetAllState,
} = multiImagesSlice.actions

export default multiImagesSlice.reducer
