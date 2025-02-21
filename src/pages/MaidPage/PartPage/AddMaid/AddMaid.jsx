import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  DatePicker,
  Select,
  InputNumber,
  message,
  Row,
  Col,
  Typography,
  Cascader,
  Radio,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";
import moment from "moment";
import "../../StylePage/AddMaid.css";

const { Option } = Select;
const { Title } = Typography;

const AddMaid = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [healthCert, setHealthCert] = useState(null);
  const [locationWork, setLocationWork] = useState([]);
  const [dataFetch, setDataFetch] = useState([]);

  const dayOrder = {
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
    Sunday: 7,
  };

  const sortDays = (days) => {
    return days.sort((a, b) => dayOrder[a] - dayOrder[b]);
  };

  const disabledDate = (current) => {
    // Disable dates after today
    return current && current > moment().endOf("day");
  };

  const beforeUpload = (file) => {
    const isJpgOrPng =
      file.type === "image/jpeg" ||
      file.type === "image/png" ||
      file.type === "image/jpg";
    if (!isJpgOrPng) {
      message.error("Bạn chỉ có thể tải lên file JPG/PNG!");
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("File phải nhỏ hơn 2MB!");
    }
    return isJpgOrPng && isLt2M;
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    setAvatar(file);
  };

  const handleHealthCertChange = (e) => {
    const file = e.target.files[0];
    setHealthCert(file);
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Log the initial values to verify data
      console.log("Form Values:", values);

      const formData = new FormData();
      const requestData = {
        helper_id: values.cmnd,
        fullName: values.hoTen,
        phone: values.sdt,
        birthDate: values.ngaysinh.format("YYYY-MM-DD"),
        gender: values.gioiTinh,
        ethnic: values.danToc,
        educationLevel: values.trinhDoHocVan, // Change education to educationLevel
        height: values.chieuCao,
        weight: values.canNang,
        birthPlace: values.queQuan, // Changed to match the schema
        address: values.diaChiThuongTru, // Changed to match the schema
        yearOfExperience: values.soNamKinhNghiem,
        experienceDescription: values.moTaKinhNghiem,
        baseFactor: values.heSo,
        status: "active",
      };

      // Log requestData to verify object structure
      console.log("Request Data:", requestData);

      // Xử lý location (workingArea)
      if (values.khuVucLamViec && values.khuVucLamViec.length >= 2) {
        // Use khuVucLamViec (area of working) instead of location
        requestData.workingArea = {
          province: values.khuVucLamViec[0],
          districts: [values.khuVucLamViec[1]],
        };
      }

      // Service title
      if (values.serviceTitle) {
        requestData.jobDetail = values.serviceTitle;
      }

      // Append all text data with explicit type checking
      Object.keys(requestData).forEach((key) => {
        if (requestData[key] !== undefined && requestData[key] !== null) {
          if (Array.isArray(requestData[key])) {
            // Handle arrays properly
            requestData[key].forEach((value) => {
              formData.append(`${key}[]`, value);
            });
          } else if (typeof requestData[key] === "object") {
            // Handle workingArea object
            Object.keys(requestData[key]).forEach((subKey) => {
              if (Array.isArray(requestData[key][subKey])) {
                requestData[key][subKey].forEach((value) => {
                  formData.append(`workingArea[${subKey}][]`, value);
                });
              } else {
                formData.append(
                  `workingArea[${subKey}]`,
                  String(requestData[key][subKey])
                );
              }
            });
          } else {
            // Convert numbers to strings if necessary
            formData.append(key, String(requestData[key]));
          }
        }
      });

      // Handle file uploads with error checking
      if (avatar) {
        formData.append("avatar", avatar);
      }

      if (healthCert) {
        formData.append("healthCertificates", healthCert); // Changed to match the schema and pluralized
      }

      console.log("Nội dung FormData:");
      for (let pair of formData.entries()) {
        console.log(pair[0] + ": " + pair[1]);
      }

      // Add error handling for the API call
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}admin/helpers/create`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (response.data.success === false) {
          message.error(response.data.msg);
        } else {
          message.success("Thêm người giúp việc thành công");
          form.resetFields();
          setAvatar(null);
          setHealthCert(null);
        }
      } catch (axiosError) {
        console.error("API Error:", axiosError);
        if (axiosError.response) {
          console.error("Response Data:", axiosError.response.data);
          console.error("Response Status:", axiosError.response.status);
          message.error(
            `Lỗi: ${
              axiosError.response.data.error || "Không thể kết nối đến server"
            }`
          );
        } else if (axiosError.request) {
          console.error("Request Error:", axiosError.request);
          message.error("Không nhận được phản hồi từ server");
        } else {
          console.error("Error Message:", axiosError.message);
          message.error("Lỗi khi gửi yêu cầu");
        }
      }
    } catch (error) {
      console.error("Form Processing Error:", error);
      message.error("Lỗi xử lý form: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Update the fetchData in useEffect:
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}admin/requests/create`
        );
        console.log(response);
        setDataFetch(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  // Add new useEffect for formatting locations data
  useEffect(() => {
    if (dataFetch && dataFetch.locations) {
      const formattedLocationWork = dataFetch.locations.map((province) => ({
        value: province.Name,
        label: province.Name,
        children: province.Districts.map((district) => ({
          value: district.Name,
          label: district.Name,
        })),
      }));
      setLocationWork(formattedLocationWork);
    }
  }, [dataFetch]);

  return (
    <div className="add-maid-wrapper" style={{ margin: "90px 0 0 20px" }}>
      <div className="header-container">
        <div className="green-header">
          <span className="header-title">Thêm người giúp việc</span>
        </div>
      </div>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        className="add-maid-form"
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="hoTen"
              label="Họ và tên"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập họ và tên",
                },
              ]}
            >
              <Input placeholder="Nhập họ và tên" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="cmnd"
              label="CMND/CCCD"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập CMND/CCCD",
                },
              ]}
            >
              <Input placeholder="Nhập CMND/CCCD" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="ngaysinh"
              label="Ngày sinh"
              className="ant-date-dateBirth"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn ngày sinh",
                },
              ]}
            >
              <DatePicker
                style={{ width: "100%", height: "32px" }}
                format="DD-MM-YYYY"
                placeholder="Chọn ngày sinh"
                disabledDate={disabledDate}
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
                <Option value="Khác">Khác</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="danToc"
              label="Dân tộc"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập dân tộc",
                },
              ]}
            >
              <Input placeholder="Nhập dân tộc" />
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
              <Input placeholder="Nhập trình độ học vấn" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="chieuCao"
              label="Chiều cao (cm)"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập chiều cao",
                },
              ]}
            >
              <InputNumber
                min={0}
                style={{
                  width: "100%",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  fontSize: "22px",
                }}
                placeholder="Nhập chiều cao"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="canNang"
              label="Cân nặng (kg)"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập cân nặng",
                },
              ]}
            >
              <InputNumber
                min={0}
                style={{
                  width: "100%",
                  height: "32px",
                  display: "flex",
                  fontSize: "22px",
                  alignItems: "center",
                }}
                placeholder="Nhập cân nặng"
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="sdt"
              label="Số điện thoại"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập số điện thoại",
                },
              ]}
            >
              <Input placeholder="Nhập số điện thoại" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="queQuan"
              label="Quê quán"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập quê quán",
                },
              ]}
            >
              <Input placeholder="Nhập quê quán" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="diaChiThuongTru"
              label="Địa chỉ thường trú"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập địa chỉ thường trú",
                },
              ]}
            >
              <Input placeholder="Nhập địa chỉ thường trú" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="serviceTitle"
              label="Loại dịch vụ"
              rules={[{ required: true, message: "Vui lòng chọn dịch vụ!" }]}
            >
              <Radio.Group className="service-radio-group">
                {dataFetch &&
                dataFetch.serviceList &&
                dataFetch.serviceList.length > 0 ? (
                  dataFetch.serviceList.map((service, index) => (
                    <Radio key={index} value={service.title}>
                      {service.title}
                    </Radio>
                  ))
                ) : (
                  <div>Đang tải dịch vụ...</div>
                )}
              </Radio.Group>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="soNamKinhNghiem"
              label="Số năm kinh nghiệm"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập số năm kinh nghiệm",
                },
                {
                  type: "number",
                  message: "Vui lòng nhập số",
                },
              ]}
            >
              <InputNumber
                min={0}
                style={{
                  width: "100%",
                  height: "32px",
                  display: "flex",
                  fontSize: "22px",
                  alignItems: "center",
                }}
                placeholder="Nhập số năm kinh nghiệm"
              />
            </Form.Item>
          </Col>
          <Col span={12} className="location-custom">
            <Form.Item
              name="khuVucLamViec"
              label="Khu vực làm việc"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập khu vực làm việc",
                },
              ]}
            >
              <Cascader
                options={locationWork}
                placeholder="Chọn Tỉnh/Thành phố, Quận/Huyện"
                showSearch
                changeOnSelect
                className="cascader-custom"
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="workingDays" label="Ngày làm việc trong tuần">
              <Select
                mode="multiple"
                placeholder="Chọn ngày"
                optionLabelProp="label"
                className="system-page-select"
                onChange={(values) => {
                  // Khi có sự thay đổi, form field sẽ được cập nhật với mảng đã được sắp xếp
                  const sortedValues = sortDays(values);
                  form.setFieldValue("workingDays", sortedValues);
                }}
              >
                <Option value="Monday" label="Thứ 2">
                  Thứ 2
                </Option>
                <Option value="Tuesday" label="Thứ 3">
                  Thứ 3
                </Option>
                <Option value="Wednesday" label="Thứ 4">
                  Thứ 4
                </Option>
                <Option value="Thursday" label="Thứ 5">
                  Thứ 5
                </Option>
                <Option value="Friday" label="Thứ 6">
                  Thứ 6
                </Option>
                <Option value="Saturday" label="Thứ 7">
                  Thứ 7
                </Option>
                <Option value="Sunday" label="Chủ Nhật">
                  Chủ Nhật
                </Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="heSo"
              label="Hệ số"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập hệ số",
                },
                {
                  type: "number", // Thêm rule này
                  message: "Vui lòng nhập số",
                },
              ]}
            >
              <InputNumber
                min={0}
                step={0.1}
                style={{
                  width: "100%",
                  height: "32px",
                  display: "flex",
                  fontSize: "22px",
                  alignItems: "center",
                }}
                placeholder="Nhập hệ số"
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name="moTaKinhNghiem" label="Mô tả kinh nghiệm">
              <Input.TextArea rows={4} placeholder="Nhập mô tả kinh nghiệm" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="avatar" label="Hình ảnh">
              <Input
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={handleAvatarChange}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="healthCertificates" label="Giấy khám sức khoẻ">
              <Input
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={handleHealthCertChange}
              />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="add-maid-button"
          >
            Thêm người giúp việc
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AddMaid;
