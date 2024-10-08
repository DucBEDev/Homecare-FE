import React, { useState } from "react";
import { DownOutlined } from "@ant-design/icons";
import { Dropdown, Menu, Space } from "antd";
import { DropdownLink } from "./index";

// const dataTypeMapping = {
//   'Item 1': 'pendingOrders',   // Đơn hàng chưa xác định
//   'Item 2': 'processingOrders', // Đơn hàng chờ xử lý
//   'Item 3': 'orderHistory'      // Lịch sử đơn hàng
// };

const DropdownSortComponent = () => {
  const [selectedLabel, setSelectedLabel] = useState("Tất cả");
  // const [dataType, setDataType] = useState(dataTypeMapping['Item 3']); // Phân loại dữ liệu mặc định

  const handleMenuClick = (e) => {
    // Tìm nhãn của mục đã chọn dựa trên key
    const item = menuItems.find((item) => item.key === e.key);
    if (item) {
      setSelectedLabel(item.label); // Cập nhật nhãn đã chọn

      // Lấy phân loại dữ liệu từ ánh xạ dựa trên nhãn
      // const type = dataTypeMapping[label];
      // setDataType(type);

      // // Thực hiện yêu cầu hoặc thao tác dựa trên phân loại dữ liệu
      // fetchDataByType(type);
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
      defaultSelectedKeys={["3"]}
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
