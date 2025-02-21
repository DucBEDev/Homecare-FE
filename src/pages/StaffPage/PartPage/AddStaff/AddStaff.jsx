import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  DatePicker,
  Card,
  Row,
  Col,
  message,
} from "antd";
import axios from "axios";
import NotificationComponent from "../../../../components/NotificationComponent/NotificationComponent";
import dayjs from "dayjs";

const AddStaff = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(null);

  const disabledDate = (current) => {
    return current && current > dayjs().endOf("day");
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const dataToSend = {
        phone: values.phoneNumber,
        staff_id: values.idCard,
        fullName: values.fullName,
        birthDate: values.birthDate.format("YYYY-MM-DD"),
        birthPlace: values.address,
      };

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}admin/staffs/create`,
        dataToSend,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        setShowNotification({
          status: "success",
          message: "Thành công",
          description: "Thêm nhân viên thành công!",
        });
        form.resetFields();
      } else {
        setShowNotification({
          status: "error",
          message: "Thất bại",
          description: "Thêm nhân viên thất bại!",
        });
      }
    } catch (error) {
      console.error("Error adding staff:", error);
      setShowNotification({
        status: "error",
        message: "Thất bại",
        description: `Lỗi khi thêm nhân viên: ${error.message}`,
      });
    } finally {
      setLoading(false);
      setTimeout(() => setShowNotification(null), 3000);
    }
  };

  return (
    <>
      <div
        className="permission-page-wrapper"
        style={{ marginTop: "90px", marginLeft: "10px" }}
      >
        <div className="header-container" style={{ marginLeft: "10px" }}>
          <div className="green-header">
            <span className="header-title">Thêm nhân viên</span>
          </div>
        </div>
        <Card className="permission-page-card" style={{ border: "none" }}>
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="phoneNumber"
                  label="Số điện thoại"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập số điện thoại!",
                    },
                  ]}
                >
                  <Input placeholder="Nhập số điện thoại" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="idCard"
                  label="CMND"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập CMND!",
                    },
                  ]}
                >
                  <Input placeholder="Nhập CMND" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="fullName"
                  label="Họ tên"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập họ tên!",
                    },
                  ]}
                >
                  <Input placeholder="Nhập họ tên" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="birthDate"
                  label="Ngày sinh"
                  rules={[{ required: true, message: "Vui lòng chọn ngày sinh!" }]}
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    format="DD/MM/YYYY"
                    disabledDate={disabledDate}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="address"
                  label="Địa chỉ"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập địa chỉ!",
                    },
                  ]}
                >
                  <Input placeholder="Nhập địa chỉ" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item style={{ textAlign: "center" }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                style={{
                  backgroundColor: "#3CBE5D",
                  border: "none",
                  fontSize: "14px",
                }}
              >
                Thêm nhân viên
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
      {showNotification && (
        <NotificationComponent
          status={showNotification.status}
          message={showNotification.message}
          description={showNotification.description}
        />
      )}
    </>
  );
};

export default AddStaff;