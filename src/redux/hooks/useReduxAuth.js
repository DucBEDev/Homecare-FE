import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { loginUser, logoutUser, verifyToken, clearError } from "../slides/authSlice";
import axios from 'axios';

export const useReduxAuth = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, token, user, loading, error } = useSelector((state) => state.auth);
  const [isInitializing, setIsInitializing] = useState(true);

  // Thiết lập token cho axios header và kiểm tra tính hợp lệ của token khi component mount
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        await dispatch(verifyToken());
      }
      setIsInitializing(false);
    };

    initAuth();
  }, [dispatch, token]);

  // Hàm đăng nhập
  const login = async (credentials) => {
    try {
      const result = await dispatch(loginUser(credentials)).unwrap();
      
      // Thiết lập token cho các yêu cầu tiếp theo
      if (result && result.token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${result.token}`;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  // Hàm đăng xuất
  const logout = async () => {
    await dispatch(logoutUser());
    delete axios.defaults.headers.common['Authorization'];
  };

  // Xóa lỗi
  const clearAuthError = () => {
    dispatch(clearError());
  };

  return {
    isAuthenticated,
    token,
    user,
    loading: loading || isInitializing,
    error,
    login,
    logout,
    clearAuthError
  };
};