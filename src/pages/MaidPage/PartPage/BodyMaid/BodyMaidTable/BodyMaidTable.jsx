import React, { useCallback, useEffect, useState } from "react";
import { Pagination, Table } from "antd";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import ButtonComponent from "../../../../../components/ButtonComponent/ButtonComponent";

const BodyMaidTable = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const searchValue = useSelector((state) => state.search.value);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const columns = [
    {
      title: "Số điện thoại",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      sorter: (a, b) => a.phoneNumber.localeCompare(b.phoneNumber),
    },
    {
      title: "CMND",
      dataIndex: "idCard",
      key: "idCard",
      sorter: (a, b) => a.idCard.localeCompare(b.idCard),
    },
    {
      title: "Họ tên",
      dataIndex: "fullName",
      key: "fullName",
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
    },
    {
      title: "Ngày sinh",
      dataIndex: "birthDate",
      key: "birthDate",
      sorter: (a, b) => new Date(a.birthDate) - new Date(b.birthDate),
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
      sorter: (a, b) => a.address.localeCompare(b.address),
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
          ></ButtonComponent>
          <ButtonComponent
            size="large"
            textButton="Lịch"
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
          ></ButtonComponent>
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
          ></ButtonComponent>
        </span>
      ),
    },
  ];

  const handleViewDetails = useCallback(
    (recordId) => {
      navigate(`/order/processing/showDetail`, { state: { id: recordId } });
    },
    [navigate]
  );

  const handleEditDetails = useCallback(
    (recordId) => {
      navigate(`/order/processing/editDetail`, { state: { id: recordId } });
    },
    [navigate]
  );

  const handleDeleteDetails = useCallback(
    (recordId) => {
      navigate(`/processing/showDetail`);
    },
    [navigate]
  );

  // Mock data - sau này sẽ được thay thế bằng dữ liệu thật từ API
  const data = [
    {
      id: 1,
      phoneNumber: "0986735232",
      idCard: "123456789",
      fullName: "Nguyễn Văn A",
      birthDate: "1990-03-15",
      address: "Quận 2, TP.HCM",
    },
    {
      id: 2,
      phoneNumber: "0986351731",
      idCard: "987654321",
      fullName: "Trần Thị B",
      birthDate: "1992-07-20",
      address: "Quận Bình Thạnh, TP.HCM",
    },
    {
      id: 3,
      phoneNumber: "0986351732",
      idCard: "987654322",
      fullName: "Lê Văn C",
      birthDate: "1993-08-21",
      address: "Quận 1, TP.HCM",
    },
    {
      id: 4,
      phoneNumber: "0986351733",
      idCard: "987654323",
      fullName: "Phạm Thị D",
      birthDate: "1994-09-22",
      address: "Quận 3, TP.HCM",
    },
    {
      id: 5,
      phoneNumber: "0986351734",
      idCard: "987654324",
      fullName: "Hoàng Văn E",
      birthDate: "1995-10-23",
      address: "Quận 4, TP.HCM",
    },
    {
      id: 6,
      phoneNumber: "0986351735",
      idCard: "987654325",
      fullName: "Ngô Thị F",
      birthDate: "1996-11-24",
      address: "Quận 5, TP.HCM",
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

  const handleDelete = (id) => {
    // Xử lý xóa người giúp việc
    console.log("Delete maid with id:", id);
  };

  return (
    <div className="processing-maids-container">
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

export default BodyMaidTable;
