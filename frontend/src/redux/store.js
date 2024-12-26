import { configureStore } from '@reduxjs/toolkit'
import accountReducer from './accountSlide' 

export const store = configureStore({
  reducer: {
    account: accountReducer,
  },
})