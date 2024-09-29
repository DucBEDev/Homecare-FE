import React, { useCallback, useEffect, useState } from "react";
import { Pagination, Table } from "antd";
import "./styleTable.css";
import axios from "axios";

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
    title: "Địa chỉ",
    dataIndex: "address",
    key: "address",
    render: (text) => (
      <span className="column-with-icon request-icon">{text}</span>
    ),
    filters: [
      { text: "Quận 1", value: "Quận 1" },
      { text: "Quận 2", value: "Quận 2" },
      { text: "Quận 3", value: "Quận 3" },
      { text: "Quận 4", value: "Quận 4" },
      { text: "Quận 5", value: "Quận 5" },
      { text: "Quận 6", value: "Quận 6" },
      { text: "Quận 7", value: "Quận 7" },
      { text: "Quận 8", value: "Quận 8" },
      { text: "Quận 9", value: "Quận 9" },
      { text: "Quận 10", value: "Quận 10" },
      { text: "Quận 11", value: "Quận 11" },
      { text: "Quận 12", value: "Quận 12" },
      { text: "Quận Tân Phú", value: "Quận Tân Phú" },
      { text: "Quận Tân Bình", value: "Quận Tân Bình" },
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

const ProcessingOrders = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState(data);
  const pageSize = 6;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/admin/requests?status=notDone`);
        console.log({response});
        const transformedData = response.data.records.map((record, index) => ({
          key: record._id,
          phoneNumber: record.customerInfo.phone,
          requestType: record.requestType,
          address: record.location.district,
          serviceType: record.serviceTitle,
          requestDate: new Date(record.createdAt).toLocaleDateString(),
          cost: `${record.negotiationCosts}đ`,
          status: record.status,
        }));
        setData(transformedData);
        setFilteredData(transformedData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getCurrentPageData = useCallback(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [currentPage, filteredData]);

  return (
    <div className="processing-orders-container">
      <Table
        columns={columns}
        dataSource={getCurrentPageData()}
        onChange={onChange}
        className="custom-table"
        loading={loading}
        pagination={false}
      />
      <Pagination
        align="center"
        current={currentPage}
        total={filteredData.length}
        pageSize={pageSize}
        onChange={setCurrentPage}
        style={{
          marginTop: "16px",
          position: "fixed",
          bottom: "10px",
          right: "600px",
        }}
      />
    </div>
  );
};

export default ProcessingOrders;