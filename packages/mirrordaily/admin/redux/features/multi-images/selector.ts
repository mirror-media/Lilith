import type { RootState } from '../../store'

export const selectHasFiles = (state: RootState) =>
  state.multiImages.files.length > 0

export const selectFiles = (state: RootState) => state.multiImages.files

export const selectUidsOfFile = (state: RootState) =>
  state.multiImages.files.map((data) => data.uid)

export const selectImageData = (uid: string) => (state: RootState) =>
  state.multiImages.files.find((file) => file.uid === uid)

export const selectShouldSetWatermarkToAll = (state: RootState) =>
  state.multiImages.shouldSetWatermarkToAll
