import type { RootState } from '../../store'

export const selectHasFiles = (state: RootState) =>
  state.multiImages.files.length > 0
