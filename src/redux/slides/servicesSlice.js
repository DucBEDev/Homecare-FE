// src/features/services/servicesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async Thunk for fetching services
export const fetchServices = createAsyncThunk(
  'services/fetchServices',
  async () => {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}admin/services`);
    return response.data; // Giả sử API trả về mảng services
  }
);

// Async Thunk for creating a service
export const createService = createAsyncThunk(
  'services/createService',
  async (newService, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}admin/services/create`, newService);
       if (response.data.success) {
            return response.data.service; // Giả định API trả về service mới được tạo
        } else {
            return rejectWithValue(response.data.error); // Chuyển error message xuống
        }

    } catch (error) {
        return rejectWithValue(error.response?.data?.error || 'An unexpected error occurred');
    }
  }
);


const initialState = {
  services: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const servicesSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
      // Các reducers đồng bộ (nếu cần)
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchServices.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.services = action.payload; // Cập nhật state với dữ liệu từ API
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
       .addCase(createService.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(createService.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.services.push(action.payload); // Thêm service mới vào state
            })
            .addCase(createService.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload; // Lấy error từ rejectWithValue
            });
  },
});

export default servicesSlice.reducer;