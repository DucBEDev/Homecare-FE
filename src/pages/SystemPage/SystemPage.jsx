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
import { useNavigate } from "react-router-dom";
import "./SystemPage.css";
import moment from "moment";
import NotificationComponent from "../../components/NotificationComponent/NotificationComponent";

const { Option } = Select;
const { Title } = Typography;
const { RangePicker } = DatePicker;

const SystemPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSystemSettings = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}admin/generalSettings`
        );
        const settings = response.data.generalSetting;
        console.log("settings", settings);

        const holidayStartDay = settings.holidayStartDate
          ? moment(settings.holidayStartDate)
          : null;
        const holidayEndDate = settings.holidayEndDate
          ? moment(settings.holidayEndDate)
          : null;

        // Fix lỗi map of undefined ở đây
        form.setFieldsValue({
          companyName: "Công ty TNHH HomeKare",
          companyEmail: "ptitABC@gmail.com",
          companyAddress: "97 Đa Kao Quận 1 TpHCM",
          companyNumberPhone: "0912345678",
          openHour: moment(settings.openHour, "HH:mm"),
          closeHour: moment(settings.closeHour, "HH:mm"),
          officeStartTime: moment(settings.officeStartTime, "HH:mm"),
          officeEndTime: moment(settings.officeEndTime, "HH:mm"),
          workingDays: settings.workingDays,
          holidays: [holidayStartDay, holidayEndDate],
          basicSalary: settings.baseSalary,
        });
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu hệ thống:", error);
        message.error("Lỗi khi lấy dữ liệu hệ thống");
      } finally {
        setLoading(false);
      }
    };

    fetchSystemSettings();
  }, []);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      let holidayStartDate =
        values.holidays === null ? "" : values.holidays[0].format("YYYY-MM-DD");
      let holidayEndDate =
        values.holidays === null ? "" : values.holidays[1].format("YYYY-MM-DD");

      const dataToSend = {
        baseSalary: values.basicSalary,
        openHour: values.openHour.format("HH:mm"),
        closeHour: values.closeHour.format("HH:mm"),
        officeStartTime: values.officeStartTime.format("HH:mm"),
        officeEndTime: values.officeEndTime.format("HH:mm"),
        companyName: values.companyName,
        companyEmail: values.companyEmail,
        companyAddress: values.companyAddress,
        companyPhone: values.companyNumberPhone,
        holidayStartDate: holidayStartDate,
        holidayEndDate: holidayEndDate,
      };

      console.log("c", dataToSend);

      const response = await axios.patch(
        `${process.env.REACT_APP_API_URL}admin/generalSettings/update`,
        dataToSend,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        // Hiển thị thông báo thành công
        setShowNotification({
          status: "success",
          message: "Thành công",
          description: "Cập nhật thông tin hệ thống thành công",
        });

        // Tắt thông báo sau 3 giây
        setTimeout(() => {
          setShowNotification(null);
        }, 3000);
      } else {
        // Xử lý lỗi nếu response.status không phải 200
        setShowNotification({
          status: "error",
          message: "Thất bại",
          description: "Cập nhật thông tin hệ thống thất bại",
        });

        // Tắt thông báo sau 3 giây
        setTimeout(() => {
          setShowNotification(null);
        }, 3000);
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin hệ thống:", error);
      // Hiển thị thông báo lỗi
      setShowNotification({
        status: "error",
        message: "Thất bại",
        description: "Lỗi khi cập nhật thông tin hệ thống: " + error.message,
      });

      // Tắt thông báo sau 3 giây
      setTimeout(() => {
        setShowNotification(null);
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
              style={{ marginTop: "-6px" }}
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
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="companyAddress" label="Address">
                  <Input className="system-page-input" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="companyNumberPhone"
                  label="SĐT công ty"
                  rules={[
                    { required: true, message: "Vui lòng nhập sđt công ty" },
                  ]}
                >
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
                  <TimePicker
                    format="HH:mm"
                    minuteStep={30}
                    className="system-page-input"
                  />
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
                  <TimePicker
                    format="HH:mm"
                    minuteStep={30}
                    className="system-page-input"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="officeStartTime"
                  label="Giờ bắt đầu hành chính"
                  rules={[
                    { required: true, message: "Vui lòng nhập giờ mở cửa" },
                  ]}
                >
                  <TimePicker
                    format="HH:mm"
                    minuteStep={30}
                    className="system-page-input"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="officeEndTime"
                  label="Giờ kết thúc hành chính"
                  rules={[
                    { required: true, message: "Vui lòng nhập giờ đóng cửa" },
                  ]}
                >
                  <TimePicker
                    format="HH:mm"
                    minuteStep={30}
                    className="system-page-input"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
             
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
              <Col span={12}>
                <Form.Item
                  name="basicSalary"
                  label="Lương cơ bản (VND)"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập lương cơ bản",
                    },
                  ]}
                >
                  <InputNumber
                    min={0}
                    className="system-page-input-number custom-input-number"
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                    }
                    parser={(value) => value.replace(/\./g, "")}
                    style={{
                      height: "40px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item style={{ marginTop: "10px" }}>
              <Button
                type="primary"
                htmlType="submit"
                className="system-page-button"
                style={{ height: "40px" }}
              >
                Lưu thay đổi
              </Button>
              <Button
                type="primary"
                className="system-page-button"
                style={{
                  marginLeft: "auto",
                  marginRight: "10px",
                  height: "40px",
                  backgroundColor: "#3CBE5D",
                  border: "none",
                }}
              >
                Tạo tài khoản
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
      <div className="system-page-wrapper">
        {showNotification && (
          <NotificationComponent
            status={showNotification.status}
            message={showNotification.message}
            description={showNotification.description}
          />
        )}
      </div>
    </>
  );
};

export default SystemPage;
