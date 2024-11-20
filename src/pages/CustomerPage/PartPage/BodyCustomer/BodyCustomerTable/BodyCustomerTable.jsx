import React, { useCallback, useEffect, useState } from "react";
import { Pagination, Table } from "antd";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import ButtonComponent from "../../../../../components/ButtonComponent/ButtonComponent";
import axios from "axios";

const BodyCustomerTable = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const searchValue = useSelector((state) => state.search.value);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState([]);
  const pageSize = 5;

  const [customers, setCustomers] = useState([]);

  const columns = [
    {
      title: "Số điện thoại",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      width: "180px",
      sorter: (a, b) => a.phoneNumber.localeCompare(b.phoneNumber),
    },
    {
      title: "Họ tên",
      dataIndex: "fullName",
      key: "fullName",
      width: "240px",
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
      width: "440px",
      sorter: (a, b) => a.address.localeCompare(b.address),
    },
    {
      title: "Điểm tích lũy",
      dataIndex: "points",
      key: "points",
      width: "150px",
      sorter: (a, b) => a.points - b.points,
    },
    {
      title: "Lựa chọn",
      key: "action",
      render: (_, record) => (
        <span className="column-with-icon action-icon">
          <ButtonComponent
            size="large"
            textButton="Chi tiết"
            styleButton={{
              backgroundColor: "#3cbe5d",
              width: "40px",
              height: "40px",
              border: "1px",
              borderRadius: "12px",
              marginRight: "2px",
            }}
            styleButtonText={{ color: "#fff" }}
            onClick={() => handleViewDetails(record.key)}
          />
          <ButtonComponent
            size="large"
            textButton="Lịch sử"
            styleButton={{
              backgroundColor: "#3ebedd",
              width: "40px",
              height: "40px",
              border: "1px",
              borderRadius: "12px",
              marginRight: "2px",
            }}
            styleButtonText={{ color: "#fff" }}
            onClick={() => handleViewHistory(record.phoneNumber)}
          />
        </span>
      ),
    },
  ];

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}admin/customers`
      );
      console.log(response);
      const transformedData = response.data.records.map(customer => ({
        key: customer._id,
        phoneNumber: customer.phone,
        fullName: customer.fullName,
        address: customer.addresses[0].detailAddress,
        points: customer.points[0].point,
      }));
      setCustomers(transformedData);
      setFilteredData(transformedData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching customers:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    let filtered = customers;

    if (searchValue) {
      filtered = filtered.filter((item) =>
        item.phoneNumber.includes(searchValue)
      );
    }

    setFilteredData(filtered);
  }, [searchValue, customers]);

  const getCurrentPageData = useCallback(() => {
    if (!filteredData) return [];
    
    const startIndex = (currentPage - 1) * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [currentPage, filteredData]);

  const handleViewDetails = useCallback(
    (recordId) => {
      navigate(`/customer/detail`, { state: { id: recordId } });
    },
    [navigate]
  );

  const handleViewHistory = useCallback(
    (phone) => {
      navigate(`/customer/history`, { state: { phone: phone } });
    },
    [navigate]
  );

  return (
    <div className="processing-customers-container">
      <Table
        columns={columns}
        dataSource={getCurrentPageData()}
        loading={loading}
        rowKey="key"
        scroll={{ x: 1000 }}
        pagination={false}
      />
      <Pagination
        align="center"
        current={currentPage}
        total={filteredData?.length || 0}
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