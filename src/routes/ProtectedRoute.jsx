import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../redux/hooks/AuthContext';
import axios from 'axios';
import { Spin } from 'antd';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, token, logout } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const verifyToken = async () => {
        
      if (!token) {
        setIsVerifying(false);
        return;
      }

      try {
        // Gọi API để kiểm tra token có hợp lệ không
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/admin/auth/verify-token`, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          withCredentials: true
        });

        if (response.data && response.data.valid) {
          setIsValid(true);
        } else {
          // Token không hợp lệ, đăng xuất
          logout();
        }
      } catch (error) {
        console.error('Token verification error:', error);
        // Token không hợp lệ hoặc hết hạn, đăng xuất
        logout();
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [token, logout]);

  if (isVerifying) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="Đang kiểm tra phiên đăng nhập..." />
      </div>
    );
  }

  // Nếu không được xác thực, chuyển hướng về trang đăng nhập và lưu lại URL hiện tại
  if (!isAuthenticated || !isValid) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Nếu đã xác thực, hiển thị component con
  return children;
};

export default ProtectedRoute;