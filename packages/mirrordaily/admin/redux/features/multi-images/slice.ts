import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { sha256 } from 'js-sha256'
import { isImageFile } from '../../../utils'

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
}

const initialState: MutilImageState = {
  files: [],
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

          return {
            uid: sha256(uInt8Data),
            name: file.name + '_' + fileNamePostfix,
            type: file.type,
            blobURL: URL.createObjectURL(file),
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
            isSelected: true,
            shouldSetWatermark: true,
          })
        }
      })

      state.files = [...state.files, ...newItems]
    })
  },
})
export const multiImagesSliceActions = multiImagesSlice.actions

export default multiImagesSlice.reducer
