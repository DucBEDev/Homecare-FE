import React, { useCallback, useEffect, useState } from "react";
import { Pagination, Table } from "antd";
import "./styleTable.css";
import axios from "axios";
import HeadOrderPage from "./HeadOrderPage";

const columns = [
  {
    title: "Số ĐT Khách Hàng",
    dataIndex: "phoneNumber",
    key: "phoneNumber",
    render: (text) => (
      <span className="column-with-icon phone-icon">{text}</span>
    ),
    sorter: (a, b) => a.phoneNumber.localeCompare(b.phoneNumber),
  },
  {
    title: "Loại Yêu cầu",
    dataIndex: "requestType",
    key: "requestType",
    render: (text) => (
      <span className="column-with-icon request-icon">{text}</span>
    ),
    filters: [
      { text: "Yêu cầu mới", value: "Yêu cầu mới" },
      { text: "Đang xử lý", value: "Đang xử lý" },
    ],
    onFilter: (value, record) => record.requestType.indexOf(value) === 0,
  },
  {
    title: "Loại Dịch Vụ",
    dataIndex: "serviceType",
    key: "serviceType",
    render: (text) => (
      <span className="column-with-icon service-icon">{text}</span>
    ),
    filters: [
      { text: "Dịch vụ A", value: "Dịch vụ A" },
      { text: "Dịch vụ B", value: "Dịch vụ B" },
    ],
    onFilter: (value, record) => record.serviceType.indexOf(value) === 0,
  },
  {
    title: "Ngày Đặt Yêu Cầu",
    dataIndex: "requestDate",
    key: "requestDate",
    render: (text) => (
      <span className="column-with-icon date-icon">{text}</span>
    ),
    sorter: (a, b) => new Date(a.requestDate) - new Date(b.requestDate),
  },
  {
    title: "Chi Phí",
    dataIndex: "cost",
    key: "cost",
    render: (text) => (
      <span className="column-with-icon cost-icon">{text}</span>
    ),
    sorter: (a, b) =>
      a.cost.replace(/[^\d]/g, "") - b.cost.replace(/[^\d]/g, ""),
  },
  {
    title: "Lựa Chọn",
    key: "actions",
    render: () => (
      <span className="column-with-icon action-icon">Xem chi tiết</span>
    ),
  },
];

const onChange = (pagination, filters, sorter, extra) => {
  console.log("params", pagination, filters, sorter, extra);
};

const data = [
  {
    key: "1",
    phoneNumber: "0987654321",
    requestType: "Yêu cầu mới",
    serviceType: "Dịch vụ A",
    requestDate: "2024-09-28",
    cost: "100,000đ",
  },
  {
    key: "2",
    phoneNumber: "04654322",
    requestType: "Đang xử lý",
    serviceType: "Dịch vụ B",
    requestDate: "2024-08-29",
    cost: "200,000đ",
  },
  {
    key: "3",
    phoneNumber: "098712654321",
    requestType: "Yêu cầu mới",
    serviceType: "Dịch vụ A",
    requestDate: "2023-01-01",
    cost: "100,000đ",
  },
  {
    key: "4",
    phoneNumber: "0154322",
    requestType: "Đang xử lý",
    serviceType: "Dịch vụ B",
    requestDate: "2023-01-02",
    cost: "20240,000đ",
  },
  {
    key: "5",
    phoneNumber: "0987654321",
    requestType: "Yêu cầu mới",
    serviceType: "Dịch vụ A",
    requestDate: "2023-01-01",
    cost: "100,000đ",
  },
  {
    key: "6",
    phoneNumber: "0554322",
    requestType: "Đang xử lý",
    serviceType: "Dịch vụ B",
    requestDate: "2023-01-02",
    cost: "20120,000đ",
  },
  {
    key: "7",
    phoneNumber: "0987654321",
    requestType: "Yêu cầu mới",
    serviceType: "Dịch vụ A",
    requestDate: "2023-01-01",
    cost: "100,000đ",
  },
  {
    key: "8",
    phoneNumber: "0987654322",
    requestType: "Đang xử lý",
    serviceType: "Dịch vụ B",
    requestDate: "2023-01-02",
    cost: "20240,000đ",
  },
  {
    key: "934",
    phoneNumber: "0987654321",
    requestType: "Yêu cầu mới",
    serviceType: "Dịch vụ A",
    requestDate: "2023-01-01",
    cost: "100,000đ",
  },
  {
    key: "265652451",
    phoneNumber: "0987654322",
    requestType: "Đang xử lý",
    serviceType: "Dịch vụ B",
    requestDate: "2023-01-02",
    cost: "24200,000đ",
  },
  {
    key: "2541",
    phoneNumber: "0987654321",
    requestType: "Yêu cầu mới",
    serviceType: "Dịch vụ A",
    requestDate: "2023-01-01",
    cost: "100,000đ",
  },
  {
    key: "25243",
    phoneNumber: "0987654322",
    requestType: "Đang xử lý",
    serviceType: "Dịch vụ B",
    requestDate: "2023-01-02",
    cost: "200,000đ",
  },
  {
    key: "1124153",
    phoneNumber: "0987654321",
    requestType: "Yêu cầu mới",
    serviceType: "Dịch vụ A",
    requestDate: "2023-01-01",
    cost: "12400,000đ",
  },
  {
    key: "21242",
    phoneNumber: "0987654322",
    requestType: "Đang xử lý",
    serviceType: "Dịch vụ B",
    requestDate: "2023-01-02",
    cost: "24200,000đ",
  },
  {
    key: "5411",
    phoneNumber: "0987654321",
    requestType: "Yêu cầu mới",
    serviceType: "Dịch vụ A",
    requestDate: "2023-01-01",
    cost: "1013310,000đ",
  },
  {
    key: "2331354",
    phoneNumber: "0987654322",
    requestType: "Đang xử lý",
    serviceType: "Dịch vụ B",
    requestDate: "2023-01-02",
    cost: "20310,000đ",
  },
  {
    key: "51341",
    phoneNumber: "0987654321",
    requestType: "Yêu cầu mới",
    serviceType: "Dịch vụ A",
    requestDate: "2023-01-01",
    cost: "3400,000đ",
  },
  {
    key: "6342",
    phoneNumber: "0934322",
    requestType: "Đaử lý",
    serviceType: "Dịch vụ B",
    requestDate: "201-02",
    cost: "20,000đ",
  },
];

const PendingOrders = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState(data);
  const pageSize = 6;

  const getCurrentPageData = useCallback(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [currentPage, filteredData]);

  const handleSearch = (searchType, searchValue) => {
    if (!searchValue) {
      setFilteredData(data);
    } else {
      const filtered = data.filter(item => 
        item[searchType].toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilteredData(filtered);
    }
    setCurrentPage(1);
  };

  const handleFilterChange = (filterType) => {
    if (filterType === 'all') {
      setFilteredData(data);
    } else {
      const filtered = data.filter(item => item.requestType === filterType);
      setFilteredData(filtered);
    }
    setCurrentPage(1);
  };

  const handleDateChange = (dateRange) => {
    if (!dateRange[0] || !dateRange[1]) {
      setFilteredData(data);
    } else {
      const filtered = data.filter(item => {
        const itemDate = new Date(item.requestDate);
        return itemDate >= dateRange[0] && itemDate <= dateRange[1];
      });
      setFilteredData(filtered);
    }
    setCurrentPage(1);
  };

  return (
    <div className="pending-orders-container">
      <Table 
        columns={columns} 
        dataSource={getCurrentPageData()} 
        onChange={onChange}
        className="custom-table"
        pagination={false} 
      />
      <Pagination
        align="center"
        current={currentPage}
        total={filteredData.length}
        pageSize={pageSize}
        onChange={setCurrentPage}
        style={{ marginTop: '16px' }}
      />
    </div>
  );
};

export default PendingOrders;




// const [loading, setLoading] = useState(true);

// useEffect(() => {
//   const fetchData = async () => {
//     try {
//       const response = await axios.get('YOUR_API_ENDPOINT_HERE');
//       setData(response.data);
//       setLoading(false);
//     } catch (error) {
//       console.error('Error fetching data:', error);
//       setLoading(false);
//     }
//   };

//   fetchData();
// }, []);

// const [data, setData] = useState([]);