import React, { useCallback, useEffect, useState } from "react";
import { Pagination, Table } from "antd";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import ButtonComponent from "../../../../../components/ButtonComponent/ButtonComponent";
import axios from "axios";

const BodyMaidTable = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const searchValue = useSelector((state) => state.search.value);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState([]);
  const pageSize = 5;

  const [helpers, setHelpers] = useState([]);

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
            textButton="Sửa"
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

  const fetchHelpers = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}admin/helpers`
      );
      console.log(response)
      const transformedData = response.data.helpers.map(helper => ({
        key: helper._id,
        phoneNumber: helper.phone,
        idCard: helper.helper_id,
        fullName: helper.fullName,
        birthDate: new Date(helper.birthDate).toLocaleDateString('vi-VN'),
        address: helper.address,
      }));
      setHelpers(transformedData);
      setFilteredData(transformedData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching helpers:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHelpers();
  }, []);

  useEffect(() => {
    let filtered = helpers;

    if (searchValue) {
      filtered = filtered.filter((item) =>
        item.phoneNumber.includes(searchValue)
      );
    }

    setFilteredData(filtered);
  }, [searchValue, helpers]);

  const getCurrentPageData = useCallback(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [currentPage, filteredData]);


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
