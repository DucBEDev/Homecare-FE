import React, { useState } from "react";
import { DownOutlined } from "@ant-design/icons";
import { Dropdown, Menu, Space } from "antd";
import { DropdownLink } from "./index";


const DropdownSortComponent = ({onChange}) => {
  const [selectedLabel, setSelectedLabel] = useState("Tất cả");

  const handleMenuClick = (e) => {
    const item = menuItems.find((item) => item.key === e.key);
    if (item) {
      setSelectedLabel(item.label);
    }
  };

  const menuItems = [
    {
      key: "0",
      label: "Tất cả",
    },
    {
      key: "1",
      label: "Mã số",
    },
    {
      key: "2",
      label: "Ngày yêu cầu",
    },
    {
      key: "3",
      label: "Số ĐT khách hàng",
    },
    {
      key: "4",
      label: "Loại yêu cầu",
    },
    {
      key: "5",
      label: "Loại dịch vụ",
    },
    {
      key: "6",
      label: "Chi phí",
    },
  ];

  const menu = (
    <Menu
      items={menuItems}
      selectable
      defaultSelectedKeys={["0"]}
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

export default DropdownSortComponent;