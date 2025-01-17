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
            onClick={() => showDeleteConfirm(record.key)}
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
        `${process.env.REACT_APP_API_URL}admin/helpers/delete/${recordId}`
      );
      if (response.status === 200) {
        setHelpers((prevHelpers) =>
          prevHelpers.filter((helper) => helper.key !== recordId)
        );
        setFilteredData((prevFilteredData) =>
          prevFilteredData.filter((helper) => helper.key !== recordId)
        );
        setShowNotification({
          status: "success",
          message: "Thành công",
          description: "Xóa người giúp việc thành công",
        });

        setTimeout(() => {
          setShowNotification(null);
        }, 3000);
        console.log("Helper deleted successfully");
      } else {
        setShowNotification({
          status: "error",
          message: "Thất bại",
          description: "Xóa người giúp việc thất bại",
        });
        console.error("Error deleting helper:", response.data.error);
      }
    } catch (error) {
      setShowNotification({
        status: "error",
        message: "Thất bại",
        description: `Lỗi khi xóa người giúp việc: ${error.message}`,
      });
      console.error("Error deleting helper:", error);
    } finally {
      setLoading(false);
    }
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

  const handleOk = () => {
    form.submit();
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const onFinish = async (values) => {
    try {
      const response = await axios.patch(
        `${process.env.REACT_APP_API_URL}admin/helpers/edit/${selectedHelper.key}`,
        {
          ...values,
          birthDate: values.birthDate.format("YYYY-MM-DD"),
        }
      );

      if (response.data.success) {
        const updatedHelpers = helpers.map((helper) =>
          helper.key === selectedHelper.key
            ? {
                ...helper,
                ...values,
                birthDate: values.birthDate.format("DD/MM/YYYY"),
              }
            : helper
        );
        setHelpers(updatedHelpers);
        setFilteredData(updatedHelpers);
        setIsModalVisible(false);
        setShowNotification({
          status: "success",
          message: "Thành công",
          description: "Cập nhật thông tin người giúp việc thành công!",
        });
      } else {
        setShowNotification({
          status: "error",
          message: "Thất bại",
          description: response.data.msg,
        });
      }
    } catch (error) {
      console.error("Error updating helper:", error);
      setShowNotification({
        status: "error",
        message: "Thất bại",
        description: "Cập nhật thông tin người giúp việc thất bại!",
      });
    }
    setTimeout(() => {
      setShowNotification(null);
    }, 3000);
  };

  const disabledDate = (current) => {
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
      {showNotification && (
        <NotificationComponent
          status={showNotification.status}
          message={showNotification.message}
          description={showNotification.description}
        />
      )}
      <Modal
        title="Chỉnh sửa thông tin người giúp việc"
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

export default BodyMaidTable;
