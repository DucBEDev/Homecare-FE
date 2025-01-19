import React, { useCallback, useEffect, useState } from "react";
import { Pagination, Table, Modal, Form, Input, DatePicker } from "antd";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import ButtonComponent from "../../../../../components/ButtonComponent/ButtonComponent";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import axios from "axios";
import NotificationComponent from "../../../../../components/NotificationComponent/NotificationComponent";
import dayjs from "dayjs";

const { confirm } = Modal;

const BodyMaidTable = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const searchValue = useSelector((state) => state.search.value);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState([]);
  const pageSize = 5;
  const [showNotification, setShowNotification] = useState(null);
  const [helpers, setHelpers] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedHelper, setSelectedHelper] = useState(null);
  const [form] = Form.useForm();

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
            onClick={() => handleEdit(record.key)}
          />
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
            onClick={() => handleSchedule(record.key)}
          />
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
            onClick={() => handleDelete(record.key)}
          />
        </span>
      ),
    },
  ];

  const handleSchedule = useCallback(
    (recordId) => {
      navigate(`/helpers/schedule`, { state: { id: recordId } }); // Thay đổi route
    },
    [navigate]
  );

  const handleEdit = (recordId) => {
    const selected = helpers.find((helper) => helper.key === recordId);
    setSelectedHelper(selected);
    form.setFieldsValue({
      ...selected,
      birthDate: dayjs(selected.birthDate, "DD/MM/YYYY"),
    });
    setIsModalVisible(true);
  };

  const handleDelete = (recordId) => {
    const selected = helpers.find((helper) => helper.key === recordId);
    setSelectedHelper(selected);
    form.setFieldsValue({
      ...selected,
      birthDate: dayjs(selected.birthDate, "DD/MM/YYYY"),
    });
    setIsModalVisible(true);
  };

  const fetchHelpers = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}admin/helpers`
      );
      const transformedData = response.data.helpers.map((helper) => ({
        key: helper._id,
        phoneNumber: helper.phone,
        idCard: helper.helper_id,
        fullName: helper.fullName,
        birthDate: helper.birthDate
          ? dayjs(helper.birthDate).format("DD/MM/YYYY")
          : "",
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
        rowKey="key"
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
