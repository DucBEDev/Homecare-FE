import React from 'react';
import { Menu } from 'antd';
import { Link } from 'react-router-dom';
import { 
  DashboardOutlined, 
  UserOutlined, 
  CustomerServiceOutlined,
  TeamOutlined,
  FileTextOutlined,
  SettingOutlined,
  LockOutlined,
  DollarOutlined,
  ShoppingOutlined
} from '@ant-design/icons';
  import { useAuth } from '../../redux/hooks/AuthContext';

const Sidebar = () => {
  const { hasPermission } = useAuth();

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/">Dashboard</Link>,
      permission: 'dashboard_view',
    },
    {
      key: 'services',
      icon: <ShoppingOutlined />,
      label: <Link to="/services">Dịch vụ</Link>,
      permission: 'services_view',
    },
    {
      key: 'order',
      icon: <FileTextOutlined />,
      label: <Link to="/order">Đơn hàng</Link>,
      permission: 'services_view',
    },
    {
      key: 'helpers',
      icon: <CustomerServiceOutlined />,
      label: <Link to="/maid">Người giúp việc</Link>,
      permission: 'helpers_view',
    },
    {
      key: 'staffs',
      icon: <TeamOutlined />,
      label: <Link to="/staff">Nhân viên</Link>,
      permission: 'staffs_view',
    },
    {
      key: 'customers',
      icon: <UserOutlined />,
      label: <Link to="/customer">Khách hàng</Link>,
      permission: 'customers_view',
    },
    {
      key: 'blogs',
      icon: <FileTextOutlined />,
      label: <Link to="/blog">Blogs</Link>,
      permission: 'blogs_view',
    },
    {
      key: 'finance',
      icon: <DollarOutlined />,
      label: <Link to="/finance">Hệ số giá</Link>,
      permission: 'costCoefficients_view',
    },
    {
      key: 'system',
      icon: <SettingOutlined />,
      label: <Link to="/system">Cài đặt chung</Link>,
      permission: 'generalSetting_view',
    },
    {
      key: 'permission',
      icon: <LockOutlined />,
      label: <Link to="/permission">Phân quyền</Link>,
      permission: 'roles_view',
    },
  ];

  // Lọc menu items theo quyền
  const filteredMenuItems = menuItems.filter(item => 
    hasPermission(item.permission)
  );

  return (
    <Menu
      theme="dark"
      mode="inline"
      defaultSelectedKeys={['dashboard']}
      items={filteredMenuItems}
    />
  );
};

export default Sidebar; 