import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  DatePicker,
  Card,
  Row,
  Col,
  message,
  Select,
  Upload,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";
import NotificationComponent from "../../../../components/NotificationComponent/NotificationComponent";
import { useNavigate } from "react-router-dom";
import moment from "moment";

const { Option } = Select;

const AddStaff = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(null);
  const [avatarFileList, setAvatarFileList] = useState([]); // Thêm state cho avatar
  const [healthCertFileList, setHealthCertFileList] = useState([]); // Thêm state cho health certificate

  const disabledDate = (current) => {
    return current && current > moment().endOf("day"); // Sử dụng moment thay vì dayjs
  };

  const beforeUpload = (file) => {
    const isJpgOrPng =
      file.type === "image/jpeg" ||
      file.type === "image/png" ||
      file.type === "image/jpg";
    const isLt2M = file.size / 1024 / 1024 < 2;

    if (!isJpgOrPng) {
      message.error("Bạn chỉ có thể tải lên file JPG/PNG!");
      return Upload.LIST_IGNORE; // Ngăn chặn upload
    }
    if (!isLt2M) {
      message.error("File phải nhỏ hơn 2MB!");
      return Upload.LIST_IGNORE; // Ngăn chặn upload
    }
    return true;
  };

  const handleAvatarChange = ({ file, fileList }) => {
    setAvatarFileList(fileList);

    // Kiểm tra trạng thái upload
    if (file.status === "uploading") {
      setLoading(true);
      return;
    }
    if (file.status === "done") {
      setLoading(false);
      setShowNotification({
        status: "success",
        message: "Thành công",
        description: `${file.name} đã được tải lên thành công`,
      });
    } else if (file.status === "error") {
      setLoading(false);
      setShowNotification({
        status: "error",
        message: "Thất bại",
        description: `${file.name} tải lên thất bại.`,
      });
    }
  };

  const handleHealthCertChange = ({ file, fileList }) => {
    setHealthCertFileList(fileList);

    // Kiểm tra trạng thái upload
    if (file.status === "uploading") {
      setLoading(true);
      return;
    }
    if (file.status === "done") {
      setLoading(false);
      setShowNotification({
        status: "success",
        message: "Thành công",
        description: `${file.name} đã được tải lên thành công`,
      });
    } else if (file.status === "error") {
      setLoading(false);
      setShowNotification({
        status: "error",
        message: "Thất bại",
        description: `${file.name} tải lên thất bại.`,
      });
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("phone", values.phoneNumber);
      formData.append("staff_id", values.idCard);
      formData.append("fullName", values.fullName);
      formData.append("birthDate", values.birthDate.format("YYYY-MM-DD"));
      formData.append("birthPlace", values.address);
      formData.append("educationLevel", values.trinhDoHocVan); // Thêm educationLevel
      formData.append("gender", values.gioiTinh);  //Thêm giới tính

      // Handle file uploads
      if (avatarFileList.length > 0 && avatarFileList[0].originFileObj) {
        formData.append("avatar", avatarFileList[0].originFileObj);
      }

      if (
        healthCertFileList.length > 0 &&
        healthCertFileList[0].originFileObj
      ) {
        formData.append("healthCertificates", healthCertFileList[0].originFileObj);
      }

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}admin/staffs/create`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data", // Thay đổi Content-Type
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
        setAvatarFileList([]); // Reset danh sách file
        setHealthCertFileList([]); // Reset danh sách file
        navigate("/staff"); // Điều hướng đến trang danh sách nhân viên
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
                  rules={[
                    { required: true, message: "Vui lòng chọn ngày sinh!" },
                  ]}
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
              <Col span={12}>
                <Form.Item
                  name="gioiTinh"
                  label="Giới tính"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng chọn giới tính",
                    },
                  ]}
                >
                  <Select placeholder="Chọn giới tính">
                    <Option value="Nam">Nam</Option>
                    <Option value="Nữ">Nữ</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="trinhDoHocVan"
                  label="Trình độ học vấn"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập trình độ học vấn",
                    },
                  ]}
                >
                  <Select placeholder="Chọn trình độ">
                    <option value="Chưa có">Chưa có</option>
                    <option value="Tiểu học">Tiểu học</option>
                    <option value="THCS">THCS</option>
                    <option value="THPT">THPT</option>
                    <option value="Cao đẳng">Cao đẳng</option>
                    <option value="Đại học">Đại học</option>
                    <option value="Thạc sĩ">Thạc sĩ</option>
                    <option value="Tiến sĩ">Tiến sĩ</option>
                    <option value="other">Khác</option>
                  </Select>
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
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="avatar" label="Hình ảnh">
                  <Upload
                    beforeUpload={beforeUpload}
                    onChange={handleAvatarChange}
                    fileList={avatarFileList}
                    maxCount={1}
                    listType="picture-card"
                    className="w-full"
                    onError={(error) => {
                      setShowNotification({
                        status: "error",
                        message: "Thất bại",
                        description: `Upload thất bại: ${error.message}`,
                      });
                    }}
                    customRequest={async ({ file, onSuccess, onError }) => {
                      try {
                        onSuccess();
                      } catch (err) {
                        onError(err);
                      }
                    }}
                  >
                    {avatarFileList.length >= 1 ? null : (
                      <div className="flex flex-col items-center justify-center h-full p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 transition-colors">
                        <UploadOutlined
                          className="text-gray-400 text-2xl mb-2"
                          style={{ fontSize: "18px", marginBottom: "10px" }}
                        />
                        <div
                          className="text-sm text-gray-600 font-medium"
                          style={{ fontSize: "10px" }}
                        >
                          Click to Upload
                        </div>
                        <div
                          className="text-sm text-gray-600 font-medium"
                          style={{ fontSize: "8px", marginTop: "4px" }}
                        >
                          Kích thước &lt; 2Mb
                        </div>
                      </div>
                    )}
                  </Upload>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="healthCertificates" label="Giấy khám sức khoẻ">
                  <Upload
                    beforeUpload={beforeUpload}
                    onChange={handleHealthCertChange}
                    fileList={healthCertFileList}
                    maxCount={1}
                    listType="picture-card"
                    className="w-full"
                    onError={(error) => {
                      setShowNotification({
                        status: "error",
                        message: "Thất bại",
                        description: `Upload thất bại: ${error.message}`,
                      });
                    }}
                    customRequest={async ({ file, onSuccess, onError }) => {
                      try {
                        onSuccess();
                      } catch (err) {
                        onError(err);
                      }
                    }}
                  >
                    {healthCertFileList.length >= 1 ? null : (
                      <div className="flex flex-col items-center justify-center h-full p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 transition-colors">
                        <UploadOutlined
                          className="text-gray-400 text-2xl mb-2"
                          style={{ fontSize: "18px", marginBottom: "10px" }}
                        />
                        <div
                          className="text-sm text-gray-600 font-medium"
                          style={{ fontSize: "10px" }}
                        >
                          Click to Upload
                        </div>
                        <div
                          className="text-sm text-gray-600 font-medium"
                          style={{ fontSize: "8px", marginTop: "4px" }}
                        >
                          Kích thước &lt; 2Mb
                        </div>
                      </div>
                    )}
                  </Upload>
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