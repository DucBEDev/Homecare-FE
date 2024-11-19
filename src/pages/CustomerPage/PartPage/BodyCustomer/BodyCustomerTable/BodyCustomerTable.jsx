import React, { useCallback, useEffect, useState } from "react";
import { Pagination, Table } from "antd";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import ButtonComponent from "../../../../../components/ButtonComponent/ButtonComponent";

const BodyCustomerTable = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const searchValue = useSelector((state) => state.search.value);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const columns = [
    {
      title: "Họ và Tên",
      dataIndex: "fullName",
      key: "fullName",
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
    },
    {
      title: "Số điện thoại",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      sorter: (a, b) => a.phoneNumber.localeCompare(b.phoneNumber),
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
      sorter: (a, b) => a.address.localeCompare(b.address),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: (a, b) => (a.email || '').localeCompare(b.email || ''),
    },
    {
      title: "Điểm",
      dataIndex: "points",
      key: "points",
      width: "7%",
      sorter: (a, b) => a.points - b.points,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      sorter: (a, b) => a.status.localeCompare(b.status),
    },
    {
      title: "Hoạt động",
      key: "action",
      render: (_, record) => (
        <ButtonComponent
          size="large"
          textButton="Danh sách đơn hàng"
          styleButton={{
            backgroundColor: "#28a745",
            border: "1px",
            borderRadius: "12px",
          }}
          styleButtonText={{ color: "#fff" }}
          onClick={() => handleViewOrders(record.id)}
        />
      ),
    },
  ];

  // Mock data - thay thế bằng API call sau này
  const data = [
    {
      id: 1,
      fullName: "Phạm Minh Đức",
      phoneNumber: "0383730311",
      address: "ho-chi-minh - quan-1",
      email: "Không",
      points: 0,
      status: "Tài khoản khách",
    },
    // Thêm dữ liệu mẫu khác...
  ];

  const [filteredData, setFilteredData] = useState(data);

  useEffect(() => {
    let filtered = data;
    if (searchValue) {
      filtered = filtered.filter((item) =>
        item.phoneNumber.includes(searchValue)
      );
    }
    setFilteredData(filtered);
  }, [searchValue]);

  const getCurrentPageData = useCallback(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [currentPage, filteredData]);

  const handleViewOrders = useCallback(
    (customerId) => {
      navigate(`/customer/orders`, { state: { id: customerId } });
    },
    [navigate]
  );

  return (
    <div className="processing-customers-container">
      <Table
        columns={columns}
        dataSource={getCurrentPageData()}
        loading={loading}
        rowKey="id"
        scroll={{ x: 1000 }}
        pagination={false}
      />
      <Pagination
        align="center"
        current={currentPage}
        total={filteredData.length}
        pageSize={pageSize}
        onChange={setCurrentPage}
        hideOnSinglePage={true}
        showLessItems={true}
        style={{
          fontSize: "26px",
          transform: "translateX(-20px)",
          marginTop: "10px",
          position: "fixed",
          bottom: "20px",
          left: "50%",
          zIndex: 1000,
        }}
      />
    </div>
  );
};

export default BodyCustomerTable;