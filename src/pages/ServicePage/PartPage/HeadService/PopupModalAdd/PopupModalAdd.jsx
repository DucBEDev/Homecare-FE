import React, { useState, useEffect } from "react";
import { Modal, Form, Input, InputNumber, Radio, Button, Select } from "antd";
import axios from "axios";
import NotificationComponent from "../../../../../components/NotificationComponent/NotificationComponent";
import { useNavigate } from "react-router-dom";

const { Option } = Select;

const PopupModalAdd = ({
  isVisible,
  onClose,
  onAdd,
  setLoading,
  setShowNotification,
}) => {
  const [form] = Form.useForm();
  const [showLocalNotification, setShowLocalNotification] = useState(null);
  const [coefficientList, setCoefficientList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCoefficientList = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}admin/services`
        );
        console.log("getADd", response);

        if (response.data.success) {
          setCoefficientList(response.data.coefficientList);
        } else {
          console.error(
            "Failed to fetch coefficient list:",
            response.data.error
          );
          // Optionally show an error notification here if the API call fails
        }
      } catch (error) {
        console.error("Error fetching coefficient list:", error);
        // Optionally show an error notification here if the API call fails
      }
    };

    if (isVisible) {
      // Only fetch when the modal is visible
      fetchCoefficientList();
    }
  }, [isVisible]);

  const handleOk = () => {
    form.submit();
  };

  const handleCancel = () => {
    onClose();
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}admin/services/create`,
        values
      );

      console.log(values);
      

      if (response.data.success) {
        setShowLocalNotification({
          status: "success",
          message: "Thành công",
          description: "Dịch vụ đã được thêm thành công!",
        });
        form.resetFields();

        setTimeout(() => {
          // navigate(0); // Reload the current page after a delay
        }, 2000);
      } else {
        setShowLocalNotification({
          status: "error",
          message: "Thất bại",
          description: response.data.error || "Đã xảy ra lỗi khi thêm dịch vụ.",
        });
      }
    } catch (error) {
      console.error("Error creating service:", error);
      setShowLocalNotification({
        status: "error",
        message: "Thất bại",
        description: "Đã xảy ra lỗi khi thêm dịch vụ.",
      });
    } finally {
      setLoading(false);
      setTimeout(() => {
        setShowLocalNotification(null);
        onClose();
      }, 1500);
    }
  };

  return (
    <Modal
      title="Thêm mới dịch vụ"
      open={isVisible}
      onOk={handleOk}
      onCancel={handleCancel}
      okText="Tạo mới"
      cancelText="Hủy"
      width={800}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Tên dịch vụ: *"
          name="title"
          rules={[{ required: true, message: "Vui lòng nhập tên dịch vụ!" }]}
        >
          <Input placeholder="Nhập tên dịch vụ" style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          label="Giá Cơ bản (VNĐ/Giờ): *"
          name="basicPrice"
          rules={[{ required: true, message: "Vui lòng nhập giá cơ bản!" }]}
        >
          <InputNumber
            placeholder="Nhập giá cơ bản"
            style={{
              width: "100%",
              height: "32px",
              display: "flex",
              alignItems: "center",
              borderRadius: "10px",
              fontSize: "22px",
            }}
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
            }
            parser={(value) => value.replace(/\./g, "")}
          />
        </Form.Item>
        <Form.Item
          label="Hệ số dịch vụ: *"
          name="coefficient_id"
          rules={[{ required: true, message: "Vui lòng chọn hệ số dịch vụ!" }]}
          style={{width: "500%", minWidth:"500px"}}
        >
        
          <Select placeholder="Chọn hệ số dịch vụ" style={{ width: '100%', minWidth: '400px' }}   dropdownStyle={{ width: '400px' }}>
            {coefficientList.map((item) => (
              <Option key={item._id} value={`${item._id}`}>
                {item.title} ({item.value})
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Mô tả dịch vụ:" name="description">
          <Input.TextArea
            placeholder="Nhập mô tả dịch vụ"
            rows={4}
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Form.Item label="Trạng thái:" name="status" initialValue="active">
          <Radio.Group>
            <Radio value="active">Hoạt động</Radio>
            <Radio value="inactive">Dừng hoạt động</Radio>
          </Radio.Group>
        </Form.Item>
      </Form>

      {showLocalNotification && (
        <NotificationComponent
          status={showLocalNotification.status}
          message={showLocalNotification.message}
          description={showLocalNotification.description}
        />
      )}
    </Modal>
  );
};

export default PopupModalAdd;
