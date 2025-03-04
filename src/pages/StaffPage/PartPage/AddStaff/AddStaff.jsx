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
  Cascader,
  InputNumber,
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
  const [avatarFileList, setAvatarFileList] = useState([]);
  const [roles, setRoles] = useState([]);
  const [locations, setLocations] = useState([]);

  const disabledDate = (current) => {
    return current && current > moment().endOf("day");
  };

  const beforeUpload = (file) => {
    const isJpgOrPng =
      file.type === "image/jpeg" ||
      file.type === "image/png" ||
      file.type === "image/jpg";
    const isLt2M = file.size / 1024 / 1024 < 2;

    if (!isJpgOrPng) {
      message.error("Bạn chỉ có thể tải lên file JPG/PNG!");
      return Upload.LIST_IGNORE;
    }
    if (!isLt2M) {
      message.error("File phải nhỏ hơn 2MB!");
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  const handleAvatarChange = ({ file, fileList }) => {
    setAvatarFileList(fileList);

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}admin/staffs/create`
        );
        setRoles(response.data.roles);
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    };

    const fetchLocationData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}admin/locations`
        );
        if (response.data.success && response.data.data) {
          const formattedLocations = response.data.data.map((province) => ({
            value: province.Name,
            label: province.Name,
            children: province.Districts.map((district) => ({
              value: district.Name,
              label: district.Name,
              children: district.Wards.map((ward) => ({
                value: ward.Name,
                label: ward.Name,
              })),
            })),
          }));
          setLocations(formattedLocations);
        } else {
          console.error(
            "Error fetching location data or invalid format:",
            response.data
          );
        }
      } catch (error) {
        console.error("Error fetching location data:", error);
      }
    };

    fetchData();
    fetchLocationData();
  }, []);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("phone", values.phoneNumber); // Sửa thành "phone"
      formData.append("staff_id", values.staff_id); // Sửa thành staff_id
      formData.append("fullname", values.fullName);
      formData.append("birthDate", values.birthDate.format("YYYY-MM-DD"));
      formData.append("gender", values.gioiTinh);
      formData.append("birthPlace", values.location.join(", "));
      formData.append("role_id", values.role);
      formData.append("email", values.email);
      formData.append("salary", values.salary); 


      if (avatarFileList.length > 0 && avatarFileList[0].originFileObj) {
        formData.append("avatar", avatarFileList[0].originFileObj);
      }

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}admin/staffs/create`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 201) { // Sửa thành 201 Created
        setShowNotification({
          status: "success",
          message: "Thành công",
          description: "Thêm nhân viên thành công!",
        });
        form.resetFields();
        setAvatarFileList([]);
        navigate("/staff");
      } else {
        setShowNotification({
          status: "error",
          message: "Thất bại",
          description: "Thêm nhân viên thất bại!",
        });
      }
    } catch (error) {
      console.error("Error adding staff:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
      }
      let errorMessage = "Lỗi khi thêm nhân viên.";
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        errorMessage = error.response.data.message;
      }
      setShowNotification({
        status: "error",
        message: "Thất bại",
        description: errorMessage,
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
                  name="fullname"
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
                  name="staff_id" // Sửa ở đây
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
                  name="email"
                  label="Email"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập email!",
                    },
                  ]}
                >
                  <Input placeholder="Nhập email" />
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
                    style={{ width: "100%", height: "32px" }}
                    format="DD/MM/YYYY"
                    disabledDate={disabledDate}
                  />
                </Form.Item>
              </Col>
              <Col span={12} className="location-custom">
                <Form.Item
                  name="location"
                  label="Quê quán"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập quê quán",
                    },
                  ]}
                >
                  <Cascader
                    options={locations}
                    placeholder="Chọn Tỉnh/Thành phố, Quận/Huyện, Phường/Xã"
                    showSearch
                    changeOnSelect
                    className="cascader-custom"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="salary"
                  label="Lương"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập lương!",
                    },
                    {
                      validator: (_, value) => {
                        if (value && value > 111111) {
                          return Promise.reject("Lương không được vượt quá 111,111!");
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                  getValueFromEvent={(value) => value}
                >
                  <InputNumber
                    min={0}
                    className="system-page-input-number custom-input-number"
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                    }
                    parser={(value) => value.replace(/\./g, "")}
                    style={{
                      height: "32px",
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                    }}
                  />
                </Form.Item>
              </Col>
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
                <Form.Item
                  name="role"
                  label="Phân quyền"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng chọn phân quyền",
                    },
                  ]}
                >
                  <Select placeholder="Chọn phân quyền">
                    {roles &&
                      roles.map((role) => (
                        <Option key={role._id} value={role._id}>
                          {role.title}
                        </Option>
                      ))}
                  </Select>
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