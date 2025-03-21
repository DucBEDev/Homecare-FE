import React, { useEffect, useState } from 'react';
import { useAuth } from '../../redux/hooks/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Form, Input, Button, Alert, Card, Typography, Divider } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
import './LoginComponent.css';
import logoHomecareFinal from '../../assets/images/logoHomecareFinal.png';

const { Title, Text } = Typography;

const LoginComponent = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

// Nếu đã đăng nhập, chuyển hướng đến trang chính hoặc trang đã yêu cầu trước đó
useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const onFinish = async (values) => {
    setLoading(true);
    setError('');
    
    try {
        const payload = {
            phone: values.phone,
            password: values.password
        }

      const response = await axios.post(`${process.env.REACT_APP_API_URL}admin/auth/login`, payload, {
        withCredentials: true
      });
      
      if (response.data && response.data.token) {
        login(response.data.token, null); // Nếu cần thông tin user, cần thêm API để lấy
        navigate('/'); // Chuyển hướng đến trang chủ/dashboard
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.response && error.response.data) {
        setError(error.response.data.error || 'Đăng nhập thất bại');
      } else {
        setError('Đã xảy ra lỗi trong quá trình đăng nhập');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-left">
          <div className="login-branding">
            <div className="logo-container">
              <img src={logoHomecareFinal} alt="HomeCare Logo" className="logo" />
            </div>
            <Title level={2} className="welcome-title">Chào mừng đến với HomeCare</Title>
            <Text className="welcome-text">
              Hệ thống quản lý dịch vụ chăm sóc tại nhà chuyên nghiệp
            </Text>
          </div>
        </div>
        
        <div className="login-right">
          <Card bordered={false} className="login-card">
            <Title level={3} className="login-title">Đăng nhập</Title>
            <Text type="secondary" className="login-subtitle">
              Đăng nhập để tiếp tục vào hệ thống
            </Text>
            
            {error && <Alert message={"Tài khoản hoặc mật khẩu không khớp"} type="error" style={{ marginBottom: 24, marginTop: 16 }} />}
            
            <Form
              name="login"
              initialValues={{ remember: true }}
              onFinish={onFinish}
              layout="vertical"
              className="login-form"
            >
              <Form.Item
                name="phone"
                label="Số điện thoại"
                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
              >
                <Input 
                  prefix={<UserOutlined className="input-icon" />} 
                  placeholder="Nhập số điện thoại"
                  size="large"
                  className="login-input" 
                />
              </Form.Item>
              
              <Form.Item
                name="password"
                label="Mật khẩu"
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
              >
                <Input.Password
                  prefix={<LockOutlined className="input-icon" />}
                  placeholder="Nhập mật khẩu"
                  size="large"
                  className="login-input"
                />
              </Form.Item>

              <div className="login-options">
                <Text className="forgot-password" onClick={() => navigate('/forgot-password')}>
                  Quên mật khẩu?
                </Text>
              </div>

              <Form.Item className="login-button-container">
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading} 
                  size="large"
                  icon={<LoginOutlined />}
                  className="login-button"
                >
                  Đăng nhập
                </Button>
              </Form.Item>
              
              <Divider plain>
                <Text type="secondary">HomeCare Admin Portal</Text>
              </Divider>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoginComponent;