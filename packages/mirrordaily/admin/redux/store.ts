import { configureStore } from '@reduxjs/toolkit'
import multiImagesReducer from './features/multi-images/slice'

export const store = configureStore({
  reducer: {
    multiImages: multiImagesReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppStore = typeof store
export type AppDispatch = typeof store.dispatch
