import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { StyledMenu } from "./style";
import {
  MenuUnfoldOutlined,
  DashboardFilled,
  UnorderedListOutlined,
  TeamOutlined,
  UserOutlined,
  ProductOutlined,
  AppstoreOutlined,
  ToolOutlined,
  PoweroffOutlined,
  DatabaseOutlined,
  FormOutlined,
} from "@ant-design/icons";

const NavbarComponent = () => {
  const [isExpanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  return (
    <div>
      <StyledMenu
        itemSelectedColor="red"
        mode="inline"
        className={`sidebar ${isExpanded ? "expanded" : "collapsed"}`}
        onClick={({ key }) => {
          if (key === " ") {
            // setExpanded(prevState => !prevState);
          } else if (key === "signout") {
            // Thêm logic xử lý đăng xuất tại đây
          } else {
            navigate(key);
          }
        }}
        items={[
          {
            key: " ",
            icon: <MenuUnfoldOutlined />,
          },
          {
            label: "Thống kê",
            key: "/",
            icon: <DashboardFilled />,
          },
          {
            label: "Đơn hàng",
            key: "/order",
            icon: <UnorderedListOutlined />,
          },
          {
            label: "Người giúp việc",
            key: "/maid",
            icon: <UserOutlined />,
          },
          {
            label: "Nhân viên",
            key: "/staff",
            icon: <TeamOutlined />,
          },
          {
            label: "Khách hàng",
            key: "/customer",
            icon: <TeamOutlined />,
          },
          {
            label: "Bài viết",
            key: "/blog",
            icon: <FormOutlined />,
          },
          {
            label: "Hệ số chi phí",
            key: "/finance",
            icon: <ToolOutlined />,
          },
          {
            label: "Quản lý dịch vụ",
            key: "/services",
            icon: <ProductOutlined />,
          },
          {
            label: "Phân quyền",
            key: "/permission",
            icon: <DatabaseOutlined />,
          },
          {
            label: "Hệ thống",
            key: "/system",
            icon: <AppstoreOutlined />,
          },
          // {
          //   label: "Tài khoản",
          //   key: "/account",
          //   icon: <ProfileOutlined />,
          // },
          {
            label: "Đăng xuất",
            key: "signout",
            icon: <PoweroffOutlined />,
            danger: true,
          },
        ]}
      ></StyledMenu>
      {/* <Content /> */}
    </div>
  );
};

export default NavbarComponent;
