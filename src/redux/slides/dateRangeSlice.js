import { createSlice } from '@reduxjs/toolkit';

const dateRangeSlice = createSlice({
  name: 'dateRange',
  initialState: {
    startDate: null,
    endDate: null,
  },
  reducers: {
    setDateRange: (state, action) => {
      state.startDate = action.payload.startDate;
      state.endDate = action.payload.endDate;
    },
  },
});

export const { setDateRange } = dateRangeSlice.actions;
export default dateRangeSlice.reducer;