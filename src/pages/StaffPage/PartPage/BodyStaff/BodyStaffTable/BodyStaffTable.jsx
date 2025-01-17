import React, { useCallback, useEffect, useState } from "react";
import { Pagination, Table, Modal } from "antd";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import ButtonComponent from "../../../../../components/ButtonComponent/ButtonComponent";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import axios from "axios";
import NotificationComponent from "../../../../../components/NotificationComponent/NotificationComponent";

const { confirm } = Modal;

const BodyStaffTable = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const searchValue = useSelector((state) => state.search.value);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState([]);
  const pageSize = 5;
  const [showNotification, setShowNotification] = useState(null);

  const [staffs, setStaffs] = useState([]);

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
            onClick={() => handleEditDetails(record.key)}
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
            onClick={() => showDeleteConfirm(record.key)}
          />
        </span>
      ),
    },
  ];

  const fetchStaffs = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}admin/staffs`
      );
      console.log(response);
      const transformedData = response.data.staffs.map((staff) => ({
        key: staff._id,
        phoneNumber: staff.phone,
        idCard: staff.staff_id,
        fullName: staff.fullName,
        birthDate: new Date(staff.birthDate).toLocaleDateString("vi-VN"),
        address: staff.address || "Mốt sửa api mới có",
      }));
      setStaffs(transformedData);
      setFilteredData(transformedData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching staffs:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffs();
  }, []);

  useEffect(() => {
    let filtered = staffs;

    if (searchValue) {
      filtered = filtered.filter((item) =>
        item.phoneNumber.includes(searchValue)
      );
    }

    setFilteredData(filtered);
  }, [searchValue, staffs]);

  const getCurrentPageData = useCallback(() => {
    if (!filteredData) return [];

    const startIndex = (currentPage - 1) * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [currentPage, filteredData]);

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

  const showDeleteConfirm = (recordId) => {
    confirm({
      title: "Bạn có chắc chắn muốn xóa?",
      icon: <ExclamationCircleOutlined />,
      content: "Hành động này không thể hoàn tác.",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk() {
        handleDelete(recordId);
      },
      onCancel() {
        console.log("Cancel");
      },
    });
  };

  const handleDelete = async (recordId) => {
    setLoading(true);
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}admin/staffs/delete/${recordId}`
      );
      if (response.status === 200) {
        setStaffs((prevStaffs) =>
          prevStaffs.filter((staff) => staff.key !== recordId)
        );
        setFilteredData((prevFilteredData) =>
          prevFilteredData.filter((staff) => staff.key !== recordId)
        );
        setShowNotification({
          status: "success",
          message: "Thành công",
          description: "Xóa nhân viên thành công",
        });

        setTimeout(() => {
          setShowNotification(null);
        }, 3000);
        console.log("Staff deleted successfully");
      } else {
        setShowNotification({
          status: "error",
          message: "Thất bại",
          description: "Xóa nhân viên thất bại",
        });
        console.error("Error deleting staff:", response.data.error);
      }
    } catch (error) {
      setShowNotification({
        status: "error",
        message: "Thất bại",
        description: `Lỗi khi xóa nhân viên: ${error.message}`,
      });
      console.error("Error deleting staff:", error);
    } finally {
      setLoading(false);
    }
  };

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
      {showNotification && (
        <NotificationComponent
          status={showNotification.status}
          message={showNotification.message}
          description={showNotification.description}
        />
      )}
    </div>
  );
};

export default BodyStaffTable;
