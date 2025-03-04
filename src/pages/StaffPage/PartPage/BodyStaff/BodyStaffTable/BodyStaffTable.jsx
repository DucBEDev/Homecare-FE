import React, { useCallback, useEffect, useState } from "react";
import { Pagination, Table } from "antd";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import ButtonComponent from "../../../../../components/ButtonComponent/ButtonComponent";
import axios from "axios";
import NotificationComponent from "../../../../../components/NotificationComponent/NotificationComponent.jsx";
import dayjs from "dayjs";
import PopupModalDelete from "./PopupModalDelete/PopupModalDelete";
import { Modal, Form, Input, DatePicker, Button, Row, Col } from "antd";

const BodyStaffTable = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const searchValue = useSelector((state) => state.search.value);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState([]);
  const [pageSize, setPageSize] = useState(5);
  const [showNotification, setShowNotification] = useState(null);
  const [staffs, setStaffs] = useState([]);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [form] = Form.useForm();

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);

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
      dataIndex: "fullname",
      key: "fullname",
      sorter: (a, b) => a.fullname.localeCompare(b.fullname),
    },
    {
      title: "Ngày sinh",
      dataIndex: "birthDate",
      key: "birthDate",
      sorter: (a, b) => new Date(a.birthDate) - new Date(b.birthDate),
    },
    {
      title: "Địa chỉ",
      dataIndex: "addressStaff",
      key: "addressStaff",
      sorter: (a, b) => a.addressStaff.localeCompare(b.addressStaff),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      sorter: (a, b) => a.status.localeCompare(b.status),
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
            onClick={() => showDeleteConfirm(record.key)}
          />
        </span>
      ),
    },
  ];

  const fetchStaffs = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}admin/staffs`
      );
      const transformedData = response.data.staffs.map((staff) => ({
        key: staff._id,
        phoneNumber: staff.phone,
        idCard: staff.staff_id,
        fullname: staff.fullName,
        birthDate: dayjs(staff.birthDate).format("DD/MM/YYYY"),
        addressStaff: staff.birthPlace,
      }));
      setStaffs(transformedData);
      setFilteredData(transformedData);
    } catch (error) {
      console.error("Error fetching staffs:", error);
      setShowNotification({
        status: "error",
        message: "Lỗi",
        description: `Lỗi khi tải dữ liệu nhân viên: ${error.message}`,
      });
    } finally {
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
  }, [currentPage, filteredData, pageSize]);

  const handleSchedule = useCallback(
    (recordId) => {
      navigate(`/staff/processing/schedule`, { state: { id: recordId } });
    },
    [navigate]
  );

  const handleEdit = (recordId) => {
    const selected = staffs.find((staff) => staff.key === recordId);
    setSelectedStaff(selected);
    form.setFieldsValue({
      ...selected,
      birthDate: dayjs(selected.birthDate, "DD/MM/YYYY"),
    });
    setIsEditModalVisible(true);
  };

  const showDeleteConfirm = (recordId) => {
    const staff = staffs.find((s) => s.key === recordId);
    setSelectedStaff(staff);
    setStaffToDelete(recordId);
    setIsDeleteModalVisible(true);
  };

  const hideDeleteConfirm = () => {
    setIsDeleteModalVisible(false);
    setStaffToDelete(null);
    setSelectedStaff(null);
  };

  const handleConfirmDelete = async () => {
    if (!staffToDelete) return;
    setLoading(true);
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}admin/staffs/delete/${staffToDelete}`
      );
      if (response.status === 200) {
        setStaffs((prevStaffs) =>
          prevStaffs.filter((staff) => staff.key !== staffToDelete)
        );
        setFilteredData((prevFilteredData) =>
          prevFilteredData.filter((staff) => staff.key !== staffToDelete)
        );
        setShowNotification({
          status: "success",
          message: "Thành công",
          description: "Xóa nhân viên thành công",
        });
      } else {
        setShowNotification({
          status: "error",
          message: "Thất bại",
          description: `Lỗi khi xóa nhân viên (HTTP ${response.status})`,
        });
      }
    } catch (error) {
      setShowNotification({
        status: "error",
        message: "Thất bại",
        description: `Lỗi khi xóa nhân viên: ${error.message}`,
      });
    } finally {
      setLoading(false);
      hideDeleteConfirm();
      setTimeout(() => setShowNotification(null), 3000);
    }
  };

  const handleOk = () => {
    form.submit();
  };

  const handleCancel = () => {
    setIsEditModalVisible(false);
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await axios.patch(
        `${process.env.REACT_APP_API_URL}admin/staffs/edit/${selectedStaff.key}`,
        {
          ...values,
          birthDate: values.birthDate.format("YYYY-MM-DD"),
        }
      );

      if (response.data.success) {
        const updatedStaffs = staffs.map((staff) =>
          staff.key === selectedStaff.key
            ? {
                ...staff,
                ...values,
                birthDate: values.birthDate.format("DD/MM/YYYY"),
              }
            : staff
        );
        setStaffs(updatedStaffs);
        setFilteredData(updatedStaffs);

        setShowNotification({
          status: "success",
          message: "Thành công",
          description: "Cập nhật thông tin nhân viên thành công!",
        });
      } else {
        setShowNotification({
          status: "error",
          message: "Thất bại",
          description: response.data.msg,
        });
      }
    } catch (error) {
      console.error("Error updating staff:", error);
      setShowNotification({
        status: "error",
        message: "Thất bại",
        description: "Cập nhật thông tin nhân viên thất bại!",
      });
    } finally {
      setLoading(false);
      setIsEditModalVisible(false);
      setTimeout(() => setShowNotification(null), 3000);
    }
  };

  const disabledDate = (current) => {
    return current && current > dayjs().endOf("day");
  };

  const handleDeleteSuccess = useCallback((deletedStaff) => {
    setStaffs((prevStaffs) =>
      prevStaffs.filter((staff) => staff.key !== deletedStaff.key)
    );
    setFilteredData((prevData) =>
      prevData.filter((staff) => staff.key !== deletedStaff.key)
    );
  }, []);

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
      <div className="pagination-container">
        <Pagination
          align="center"
          current={currentPage}
          total={filteredData?.length || 0}
          pageSize={pageSize}
          onChange={setCurrentPage}
          hideOnSinglePage={true}
          showLessItems={true}
        />
      </div>
      {showNotification && (
        <NotificationComponent
          status={showNotification.status}
          message={showNotification.message}
          description={showNotification.description}
        />
      )}
      <PopupModalDelete
        isVisible={isDeleteModalVisible}
        onClose={hideDeleteConfirm}
        onDelete={handleDeleteSuccess}
        record={selectedStaff}
        setLoading={setLoading}
        setShowNotification={setShowNotification}
        staffToDelete={staffToDelete}
      />

      {/* Edit Modal */}
      <Modal
        title="Chỉnh sửa thông tin nhân viên"
        open={isEditModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Lưu"
        cancelText="Hủy"
        className="custom-modal"
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="phoneNumber"
            label="Số điện thoại"
            rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}
          >
            <Input style={{ width: "100%", borderRadius: "10px" }} />
          </Form.Item>
          <Form.Item
            name="idCard"
            label="CMND"
            rules={[{ required: true, message: "Vui lòng nhập CMND!" }]}
          >
            <Input style={{ width: "100%", borderRadius: "10px" }} />
          </Form.Item>
          <Form.Item
            name="fullname"
            label="Họ tên"
            rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
          >
            <Input style={{ width: "100%", borderRadius: "10px" }} />
          </Form.Item>
          <Form.Item
            name="birthDate"
            label="Ngày sinh"
            rules={[{ required: true, message: "Vui lòng chọn ngày sinh!" }]}
          >
            <DatePicker
              format="DD/MM/YYYY"
              disabledDate={disabledDate}
              style={{ width: "100%", height: "34px" }}
            />
          </Form.Item>
          <Form.Item
            name="addressStaff"
            label="Địa chỉ"
            rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
          >
            <Input style={{ width: "100%", borderRadius: "10px" }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BodyStaffTable;