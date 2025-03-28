import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

 

  // Kiểm tra xác thực khi component mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }
      
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}admin/auth/verify`, {
          headers: {
            Authorization: `Bearer ${storedToken}`
          },
          withCredentials: true 
        });
        
        if (response.status === 200) {
          setToken(storedToken);
          setIsAuthenticated(true);
          
          // Nếu API trả về thông tin user thì cập nhật
          if (response.data && response.data.user) {
            setUser(response.data.user);
            localStorage.setItem('user', JSON.stringify(response.data.user));
          }
        } else {
          clearAuthData();
        }
      } catch (error) {
        console.error('Auth verification error:', error);
        clearAuthData();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);
  
  // Hàm để clear dữ liệu auth
  const clearAuthData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const login = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    }
    
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      // Gọi API logout
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
    } finally {
      clearAuthData();
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      token, 
      user, 
      login, 
      logout, 
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};