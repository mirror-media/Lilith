import { configureStore } from '@reduxjs/toolkit'
import multiImagesReducer from './features/multi-images/slice'
import { listenerMiddleware } from './listener-middleware'

export const store = configureStore({
  reducer: {
    multiImages: multiImagesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(listenerMiddleware.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppStore = typeof store
export type AppDispatch = typeof store.dispatch
