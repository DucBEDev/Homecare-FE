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

const BodyStaffTable = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const searchValue = useSelector((state) => state.search.value);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState([]);
  const pageSize = 5;
  const [showNotification, setShowNotification] = useState(null);
  const [staffs, setStaffs] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
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
      const transformedData = response.data.staffs.map((staff) => ({
        key: staff._id,
        phoneNumber: staff.phone,
        idCard: staff.staff_id,
        fullName: staff.fullName,
        birthDate: dayjs(staff.birthDate).format("DD/MM/YYYY"),
        address: staff.birthPlace,
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

  const handleSchedule = useCallback(
    (recordId) => {
      navigate(`/staffs/schedule`, { state: { id: recordId } });
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
    setIsModalVisible(true);
  };

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

  const handleOk = () => {
    form.submit();
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const onFinish = async (values) => {
    console.log("values", values);
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
        setIsModalVisible(false);
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
    }
    setTimeout(() => {
      setShowNotification(null);
    }, 3000);
  };

  const disabledDate = (current) => {
    // Can not select days after today
    return current && current > dayjs().endOf("day");
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
      <Modal
        title="Chỉnh sửa thông tin nhân viên"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="phoneNumber"
            label="Số điện thoại"
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại!" },
            ]}
          >
            <Input style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="idCard"
            label="CMND"
            rules={[{ required: true, message: "Vui lòng nhập CMND!" }]}
          >
            <Input style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="fullName"
            label="Họ tên"
            rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
          >
            <Input style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="birthDate"
            label="Ngày sinh"
            rules={[{ required: true, message: "Vui lòng chọn ngày sinh!" }]}
          >
            <DatePicker format="DD/MM/YYYY" disabledDate={disabledDate} />
          </Form.Item>
          <Form.Item
            name="address"
            label="Địa chỉ"
            rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
          >
            <Input style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BodyStaffTable;
