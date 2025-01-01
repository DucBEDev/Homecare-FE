import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  TimePicker,
  Card,
  Row,
  Col,
  Typography,
  InputNumber,
  Switch,
  Select,
  message,
  DatePicker,
  Flex,
  Tag,
} from "antd";
import axios from "axios";
import dayjs from "dayjs";
import "./SystemPage.css";

const { Option } = Select;
const { Title } = Typography;
const { RangePicker } = DatePicker;

const SystemPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Dữ liệu giả lập cho hệ thống (mock data)
  const mockSystemSettings = {
    companyName: "Công ty TNHH HOMEKARE",
    companyLogo: "https://example.com/logo.png",
    companyDescription: "Mô tả về công ty ABC",
    companyAddress: "123 Đường ABC, Quận XYZ, TP. HCM",
    companyPhone: "0123456789",
    companyEmail: "info@example.com",
    companyWebsite: "https://example.com",
    openHour: dayjs("08:00", "HH:mm"),
    closeHour: dayjs("17:00", "HH:mm"),
    holidays: [dayjs("2024-01-01"), dayjs("2024-04-30"), dayjs("2024-05-01")],
    passwordMinLength: 8,
    passwordRequiresSpecialChar: true,
    passwordExpirationDays: 90,
    allowNewUserRegistration: true,
    twoFactorAuthentication: false,
    currency: "VND",
    taxRate: 10,
    basicSalary: 5000000,
    coefficientOptions: [
      { id: 1, label: "Hệ số A", value: 1.5 },
      { id: 2, label: "Hệ số B", value: 2.0 },
      { id: 3, label: "Hệ số C", value: 2.5 },
    ],
    selectedCoefficients: [1, 3],
    commissionRate: 5,
  };

  useEffect(() => {
    // Comment lại phần gọi API
    // fetchSystemSettings();

    // Load dữ liệu giả lập vào form khi component mount
    form.setFieldsValue(mockSystemSettings);
  }, []);

  // const fetchSystemSettings = async () => {
  //   setLoading(true);
  //   try {
  //     const response = await axios.get(
  //       `${process.env.REACT_APP_API_URL}admin/system-settings`
  //     );
  //     const settings = response.data;
  //     form.setFieldsValue({
  //       companyName: settings.companyName,
  //       companyLogo: settings.companyLogo,
  //       companyDescription: settings.companyDescription,
  //       companyAddress: settings.companyAddress,
  //       companyPhone: settings.companyPhone,
  //       companyEmail: settings.companyEmail,
  //       companyWebsite: settings.companyWebsite,
  //       openHour: dayjs(settings.openHour, "HH:mm"),
  //       closeHour: dayjs(settings.closeHour, "HH:mm"),
  //       workingDays: settings.workingDays,
  //       holidays: settings.holidays.map((date) => dayjs(date)),
  //       passwordMinLength: settings.passwordMinLength,
  //       passwordRequiresSpecialChar: settings.passwordRequiresSpecialChar,
  //       passwordExpirationDays: settings.passwordExpirationDays,
  //       allowNewUserRegistration: settings.allowNewUserRegistration,
  //       twoFactorAuthentication: settings.twoFactorAuthentication,
  //       currency: settings.currency,
  //       taxRate: settings.taxRate,
  //       basicSalary: settings.basicSalary,
  //       coefficientOptions: settings.coefficientOptions,
  //       selectedCoefficients: settings.selectedCoefficients,
  //       commissionRate: settings.commissionRate,
  //     });
  //   } catch (error) {
  //     console.error("Lỗi khi lấy dữ liệu hệ thống:", error);
  //     message.error("Lỗi khi lấy dữ liệu hệ thống");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // Mô phỏng hàm onFinish (không gọi API)
  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Mô phỏng request PUT đến API
      console.log("Dữ liệu sẽ được gửi đi:", values);

      // Hiển thị thông báo thành công sau 1 giây
      setTimeout(() => {
        message.success("Cập nhật thông tin hệ thống thành công (giả lập)");
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin hệ thống (giả lập):", error);
      message.error("Lỗi khi cập nhật thông tin hệ thống (giả lập)");
      setLoading(false);
    }
  };

  return (
    <div className="system-page-wrapper">
      <div className="header-container">
        <div className="green-header">
          <span className="header-title">Cài đặt hệ thống</span>
        </div>
      </div>
      <Card className="system-page-card">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className="system-page-form"
        >
          <div
            className="system-page-section-title"
            style={{ marginTop: "-4px" }}
          >
            Thông tin chung
          </div>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="companyName"
                label="Tên công ty"
                rules={[
                  { required: true, message: "Vui lòng nhập tên công ty" },
                ]}
              >
                <Input className="system-page-input" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="companyEmail" label="Email">
                <Input className="system-page-input" />
              </Form.Item>
            </Col>
          </Row>
          <div
            className="system-page-section-title"
            style={{ marginTop: "-6px" }}
          >
            Cài đặt thời gian
          </div>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="openHour"
                label="Giờ mở cửa"
                rules={[
                  { required: true, message: "Vui lòng nhập giờ mở cửa" },
                ]}
              >
                <TimePicker format="HH:mm" className="system-page-input" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="closeHour"
                label="Giờ đóng cửa"
                rules={[
                  { required: true, message: "Vui lòng nhập giờ đóng cửa" },
                ]}
              >
                <TimePicker format="HH:mm" className="system-page-input" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="workingDays" label="Ngày không làm việc trong tuần">
              {/* **Cần xử lý component chọn multiple days** */}
              <Select
                mode="multiple"
                placeholder="Chọn ngày"
                className="system-page-select"
              >
                <Option  value="Monday">Thứ 2</Option>
                <Option value="Tuesday">Thứ 3</Option>
                <Option value="Wednesday">Thứ 4</Option>
                <Option value="Thursday">Thứ 5</Option>
                <Option value="Friday">Thứ 6</Option>
                <Option value="Saturday">Thứ 7</Option>
                <Option value="Sunday">Chủ Nhật</Option>
              </Select>
            </Form.Item>
          </Col>
            <Col span={12}>
              <Form.Item
                name="holidays"
                label="Ngày nghỉ lễ"
                className="holiday-item"
              >
                <RangePicker
                  picker="date"
                  format="YYYY-MM-DD"
                  className="system-page-datepicker"
                  bordered="none"
                />
              </Form.Item>
            </Col>
          </Row>

          <div className="system-page-section-title">Cài đặt khác</div>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="basicSalary"
                label="Lương cơ bản (VND)"
                rules={[
                  { required: true, message: "Vui lòng nhập lương cơ bản" },
                ]}
              >
                <InputNumber min={0} className="system-page-input-number" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginTop: "20px" }}>
            <Button
              type="primary"
              htmlType="submit"
              className="system-page-button"
            >
              Lưu thay đổi
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default SystemPage;
