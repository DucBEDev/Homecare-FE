import { configureStore } from '@reduxjs/toolkit'
import searchReducer from './slides/searchSlice'
import dateRangeReducer from './slides/dateRangeSlice'
import servicesReducer from './slides/servicesSlice';

export const store = configureStore({
  reducer: {
    search: searchReducer,
    dateRange: dateRangeReducer,
    services: servicesReducer,
  },
})

export default store;