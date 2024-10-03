import React, { useCallback, useEffect,  useState } from "react";
import { Pagination, Table } from "antd";
import "../StylePage/styleTable.css";
import axios from "axios";
import ButtonComponent from "../../../components/ButtonComponent/ButtonComponent";
import { Outlet, useNavigate } from "react-router-dom"






const onChange = (pagination, filters, sorter, extra) => {
  console.log("params", pagination, filters, sorter, extra);
};

const ProcessingOrders = () => {
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
      title: "Trạng thái",
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
    navigate(`/order/processing/showProcessingDetail`, { state: { id: recordId }  });
  }, [navigate]);
  
  const handleEditDetails = useCallback((recordId) => {
    console.log("Xem chi tiết đơn hàng có ID:", recordId);
    navigate(`/processing/showDetail`);
  }, [navigate]);
  
  const handleDeleteDetails = useCallback((recordId) => {
    console.log("Xem chi tiết đơn hàng có ID:", recordId);
    navigate(`/processing/showDetail`);
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/admin/requests?status=notDone`);
        console.log({response});
        const transformedData = response.data.updatedRecords.map((record, index) => {
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
          address: record.location.district,
          cost: `${record.negotiationCosts}đ`,
          status: statusNow,
          }
        });
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
      <Outlet />
    </div>
    
  );
};

export default ProcessingOrders;