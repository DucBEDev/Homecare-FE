import React, { useCallback, useEffect, useState } from "react";
import { Pagination, Table } from "antd";
import "../../StylePage/styleTable.css";
import axios from "axios";
import ButtonComponent from "../../../../components/ButtonComponent/ButtonComponent";
import { useNavigate } from "react-router-dom";


const OrderHistory = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState(data);
  const pageSize = 5;
  const navigate = useNavigate();

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
        { text: "Ngắn hạn", value: "Ngắn hạn" },
        { text: "Dài hạn", value: "Dài hạn" },
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
        // ... keep other district options ...
      ],
      onFilter: (value, record) => record.address.indexOf(value) === 0,
    },
    {
      title: "Loại Dịch Vụ",
      dataIndex: "serviceType",
      key: "serviceType",
      render: (text) => (
        <span className="column-with-icon service-icon">{text}</span>
      ),
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
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (text) => (
        <span className="column-with-icon cost-icon">{text}</span>
      ),
    },
    {
      title: "Lựa Chọn",
      key: "actions",
      render: (_, record) => (
        <span className="column-with-icon action-icon">
          <ButtonComponent
            size="large"
            textButton="Chi tiết"
            styleButton={{
              backgroundImage: "linear-gradient(135deg, #07BF73 0%, #17CF73 50%, #17CF83 100%)",
              marginLeft: "6px",
              width: "54px",
              height: "40px",
              border: "1px",
              borderRadius: "12px",
            }}
            styleButtonText={{ color: "#fff" }}
            onClick={() => handleViewDetails(record.key)}
          />
        </span>
      ),
    },
  ];
  
  const handleViewDetails = useCallback((recordId) => {
    console.log("Xem chi tiết đơn hàng có ID:", recordId);
    navigate(`/order/history/showDetail`, { state: { id: recordId }  });
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}admin/requests?status=history`
        );
        console.log("re", response);
        const transformedData = response.data.requestList.map(
          (record, index) => {
            let requestName = record.requestType === "shortTerm" ? "Ngắn hạn" : "Dài hạn";
            let statusNow = ""
            if (record.status === "notDone") {
              statusNow = "Chưa tiến hành"
            } else if (record.status === "assigned") {
              statusNow = "Chưa tiến hành (Đã giao việc)"
            } else if (record.status === "unconfirmed") {
              statusNow = "Chờ xác nhận"
            } else if (record.status === "processing") {
              statusNow = "Đang tiến hành"
            } else {
              statusNow = "Đã hoàn hành"
            }
            return {
              key: record._id,
              phoneNumber: record.customerInfo.phone,
              address: record.customerInfo.address,
              requestType: requestName,
              serviceType: record.service.title,
              requestDate: new Date(record.createdAt).toLocaleDateString(),
              status: statusNow,
            };
          }
        );
        setData(transformedData);
        setFilteredData(transformedData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
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
    <div className="history-orders-container">
      <Table
        columns={columns}
        dataSource={getCurrentPageData()}
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

export default OrderHistory;
