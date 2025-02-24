import React, { useState } from 'react';
import { Modal, Form, Input, InputNumber, Radio, Button } from 'antd';
import axios from 'axios';
import NotificationComponent from "../../../../../components/NotificationComponent/NotificationComponent";
import { useNavigate } from 'react-router-dom';

const PopupModalAdd = ({ isVisible, onClose, onAdd, setLoading, setShowNotification }) => {
  const [form] = Form.useForm();
  const [showLocalNotification, setShowLocalNotification] = useState(null);
  const navigate = useNavigate();

  const handleOk = () => {
    form.submit();
  };

  const handleCancel = () => {
    onClose();
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}admin/services/create`, values);

      if (response.data.success) {
        setShowLocalNotification({
          status: "success",
          message: "Thành công",
          description: "Dịch vụ đã được thêm thành công!",
        });
        form.resetFields();

        if (onAdd) {
          onAdd(); // Notify the parent component to refresh the service list
        }
        navigate("/services/processing")
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
      visible={isVisible}
      onOk={handleOk}
      onCancel={handleCancel}
      okText="Tạo mới"
      cancelText="Hủy"
      width={800}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item
          label="Tên dịch vụ: *"
          name="title"
          rules={[{ required: true, message: 'Vui lòng nhập tên dịch vụ!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Giá Cơ bản (VNĐ/Giờ): *"
          name="basicPrice"
          rules={[{ required: true, message: 'Vui lòng nhập giá cơ bản!' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
            parser={(value) => value.replace(/\./g, '')}
          />
        </Form.Item>
        <Form.Item
          label="Phụ phí: *"
          name="phuPhi"
        >
          <Radio.Group
            defaultValue={true}
          >
            <Radio value={true}>Có</Radio>
            <Radio value={false}>Không</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          label="Phí Ngoài Giờ KH (%): *"
          name="phiNgoaiGioKH"
          rules={[{ required: true, message: 'Vui lòng nhập phí ngoài giờ KH!' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
            parser={(value) => value.replace(/\./g, '')}
          />
        </Form.Item>
        <Form.Item
          label="Phí Ngoài Giờ NGV (%): *"
          name="phiNgoaiGioNGV"
          rules={[{ required: true, message: 'Vui lòng nhập phí ngoài giờ NGV!' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
            parser={(value) => value.replace(/\./g, '')}
          />
        </Form.Item>
        <Form.Item
          label="Mô tả dịch vụ:"
          name="description"
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Trạng thái:"
          name="status"
        >
          <Radio.Group
            defaultValue={"active"}
          >
            <Radio value={"active"}>Hoạt động</Radio>
            <Radio value={"inactive"}>Dừng hoạt động</Radio>
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