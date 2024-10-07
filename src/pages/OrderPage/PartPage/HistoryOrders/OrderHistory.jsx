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
  const pageSize = 6;
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
      title: "Trạng thái đơn hàng",
      dataIndex: "status",
      key: "status",
      render: (text) => (
        <span className="column-with-icon cost-icon">{text}</span>
      ),
      sorter: (a, b) =>
        a.cost.replace(/[^\d]/g, "") - b.cost.replace(/[^\d]/g, ""),
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
                backgroundColor: "#3cbe5d",
                width: "40px",
                height: "40px",
                border: "1px",
                borderRadius: "12px",
                marginRight: "2px",
              }}
              styleButtonText={{ color: "#fff" }} 
              onClick={() => handleViewDetails(record.key)}
            >
            </ButtonComponent>
            <ButtonComponent
              size="large"
              textButton="Sửa"
              styleButton={{
                backgroundColor: "#3ebedd",
                width: "40px",
                height: "40px",
                border: "1px",
                borderRadius: "12px",
                marginRight: "2px",
              }}
              styleButtonText={{ color: "#fff" }} 
              onClick={() => handleEditDetails(record.key)}
            >
            </ButtonComponent>
            <ButtonComponent
              size="large"
              textButton="Xóa"
              styleButton={{
                backgroundColor: "#d22d2d",
                width: "40px",
                height: "40px",
                border: "1px",
                borderRadius: "12px",
              }} 
              styleButtonText={{ color: "#fff" }}
              onClick={() => handleDeleteDetails(record.key)}  
            >
            </ButtonComponent>
        </span>
      ),
    },
  ];
  
  const handleViewDetails = useCallback((recordId) => {
    console.log("Xem chi tiết đơn hàng có ID:", recordId);
    navigate(`/order/history/showHistoryDetail`, { state: { id: recordId }  });
  }, [navigate]);
  
  const handleEditDetails = useCallback((recordId) => {
    console.log("Xem chi tiết đơn hàng có ID:", recordId);
    navigate(`/order/history/editHistoryDetail`, { state: { id: recordId}  });
  }, [navigate]);
  
  const handleDeleteDetails = (recordId) => {
    console.log("Deleting details for order with ID:", recordId); 
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/admin/requests?status=done`
        );
        const transformedData = response.data.updatedRecords.map(
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
              requestType: requestName,
              serviceType: record.serviceTitle,
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

export default OrderHistory;
