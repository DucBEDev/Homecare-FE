import { configureStore } from '@reduxjs/toolkit'
import searchReducer from './slides/searchSlice'
import dateRangeReducer from './slides/dateRangeSlice'

export const store = configureStore({
  reducer: {
    search: searchReducer,
    dateRange: dateRangeReducer,
  },
})

export default store;