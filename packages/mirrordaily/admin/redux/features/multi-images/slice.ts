import { createSlice } from '@reduxjs/toolkit'
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

export const multiImagesSlice = createSlice({
  name: 'multiImages',
  initialState,
  reducers: {},
})
export const multiImagesSliceActions = multiImagesSlice.actions

export default multiImagesSlice.reducer
