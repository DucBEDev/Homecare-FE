import React, { useEffect, useState } from "react";
import { DownOutlined } from "@ant-design/icons";
import { Dropdown, Menu, Space } from "antd";
import { DropdownLink } from "./index";
import { useNavigate } from "react-router-dom";
import "./style.css"



// const dataTypeMapping = {
//   'Item 1': 'pendingOrders',   // Đơn hàng chưa xác định
//   'Item 2': 'processingOrders', // Đơn hàng chờ xử lý
//   'Item 3': 'orderHistory'      // Lịch sử đơn hàng
// };

const DropdownComponent = () => {
  const navigate = useNavigate();
  const [selectedLabel, setSelectedLabel] = useState("Đơn hàng cần xử lý");
  useEffect(() => {
    navigate("processing");
  }, [])
  // const [dataType, setDataType] = useState(dataTypeMapping['Item 3']); // Phân loại dữ liệu mặc định

  const handleMenuClick = (e) => {
    console.log(e);
    // Tìm nhãn của mục đã chọn dựa trên key
    const item = menuItems.find((item) => item.key === e.key);
    if (item) {
      setSelectedLabel(item.label); // Cập nhật nhãn đã chọn
      navigate(e.key);
    }
  };

  const menuItems = [
    {
      key: "processing",
      label: "Đơn hàng cần xử lý",
    },
    {
      key: "history",
      label: "Lịch sử đơn hàng",
    },
  ];

  const menu = (
    <Menu
      items={menuItems}
      selectable
      defaultSelectedKeys={[""]}
      style={{color: "#ffffff"}}
      onClick={handleMenuClick}
    />
  );

  // const fetchDataByType = (type) => {
  //   // Thay đổi URL hoặc phương thức dựa trên phân loại dữ liệu
  //   const url = `/api/${type}/data`; // Ví dụ URL
  //   fetch(url)
  //     .then(response => response.json())
  //     .then(data => {
  //       console.log('Fetched Data:', data);
  //       // Xử lý dữ liệu nhận được
  //     })
  //     .catch(error => {
  //       console.error('Error fetching data:', error);
  //     });
  // };

  return (
    <Dropdown overlay={menu}>
      <DropdownLink>
        <Space>
          {selectedLabel}
          <DownOutlined />
        </Space>
      </DropdownLink>
    </Dropdown>
  );
};

export default DropdownComponent;
