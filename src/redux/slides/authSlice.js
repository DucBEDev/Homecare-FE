import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Thunk để đăng nhập
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}admin/auth/login`,
        credentials,
        { withCredentials: true }
      );
      
      if (response.data && response.data.token) {
        return {
          token: response.data.token,
          user: response.data.user || null
        };
      } else {
        return rejectWithValue('Đăng nhập thất bại');
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Đăng nhập thất bại'
      );
    }
  }
);

// Thunk để kiểm tra token
export const verifyToken = createAsyncThunk(
  'auth/verify',
  async (_, { getState, rejectWithValue }) => {
    const { token } = getState().auth;
    
    if (!token) return rejectWithValue('Không có token');
    
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}admin/auth/verify`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true
      });
      
      if (response.status === 200) {
        return response.data.user || null;
      } else {
        return rejectWithValue('Token không hợp lệ');
      }
    } catch (error) {
      return rejectWithValue('Xác thực thất bại');
    }
  }
);

// Thunk để đăng xuất
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { getState }) => {
    const { token } = getState().auth;
    
    try {
      if (token) {
        await axios.get(`${process.env.REACT_APP_API_URL}admin/auth/logout`, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          withCredentials: true
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isAuthenticated: false,
    token: null,
    user: null,
    loading: false,
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Xử lý loginUser
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.loading = false;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Xử lý verifyToken
      .addCase(verifyToken.pending, (state) => {
        state.loading = true;
      })
      .addCase(verifyToken.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload;
        state.loading = false;
      })
      .addCase(verifyToken.rejected, (state) => {
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.loading = false;
      })
      
      // Xử lý logoutUser
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
      });
  }
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;