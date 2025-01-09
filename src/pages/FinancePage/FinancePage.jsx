import React, { useState, useEffect } from "react";
import {
  Form,
  InputNumber,
  Button,
  Card,
  Row,
  Col,
  Typography,
  message,
  Divider
} from "antd";
import axios from "axios";
import "./FinancePage.css"; // Bạn nên tạo file CSS riêng cho trang này
import NotificationComponent from "../../components/NotificationComponent/NotificationComponent";

const { Title } = Typography;

const FinancialPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(null);
  const [financialSettings, setFinancialSettings] = useState({}); // Thêm state để lưu trữ financialSettings

  useEffect(() => {
    const fetchFinancialSettings = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}admin/financialSettings` // Giả sử API endpoint là như này
        );
        const settings = response.data.financialSetting;
        setFinancialSettings(settings); // Lưu financialSettings vào state
        console.log("settings", settings);

        form.setFieldsValue({
          tipRate: settings.tipRate,
          holidayMultiplier: settings.holidayMultiplier,
          nightShiftMultiplier: settings.nightShiftMultiplier,
          cleaningFee: settings.cleaningFee,
          movingFee: settings.movingFee,
          disinfectingFee: settings.disinfectingFee,
          ironingFee: settings.ironingFee,
          cookingFee: settings.cookingFee,
          officeCleaningFee: settings.officeCleaningFee,
        });
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu hệ số tài chính:", error);
        message.error("Lỗi khi lấy dữ liệu hệ số tài chính");
      } finally {
        setLoading(false);
      }
    };

    fetchFinancialSettings();
  }, []);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const dataToSend = {
        ...values,
      };
      console.log("dataToSend", dataToSend);

      const response = await axios.patch(
        `${process.env.REACT_APP_API_URL}admin/financialSettings/update`, // Giả sử API endpoint là như này
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
          description: "Cập nhật thông tin hệ số tài chính thành công",
        });
        setTimeout(() => {
          setShowNotification(null);
        }, 3000);
      } else {
        setShowNotification({
          status: "error",
          message: "Thất bại",
          description: "Cập nhật thông tin hệ số tài chính thất bại",
        });
        setTimeout(() => {
          setShowNotification(null);
        }, 3000);
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin hệ số tài chính:", error);
      setShowNotification({
        status: "error",
        message: "Thất bại",
        description:
          "Lỗi khi cập nhật thông tin hệ số tài chính: " + error.message,
      });
      setTimeout(() => {
        setShowNotification(null);
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="financial-page-wrapper">
        <div className="header-container">
          <div className="green-header">
            <span className="header-title">Cài đặt hệ số tài chính</span>
          </div>
        </div>
        <Card className="financial-page-card">
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            className="financial-page-form"
          >
            <Title level={5}>Hệ số phụ cấp</Title>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="tipRate"
                  label="Tỉ lệ tiền tip (%)"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập tỉ lệ tiền tip",
                    },
                  ]}
                >
                  <InputNumber
                    min={0}
                    max={100}
                    formatter={(value) => `${value}%`}
                    parser={(value) => value.replace("%", "")}
                    className="financial-page-input-number"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="holidayMultiplier"
                  label="Hệ số lương ngày lễ"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập hệ số lương ngày lễ",
                    },
                  ]}
                >
                  <InputNumber
                    min={1}
                    className="financial-page-input-number"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="nightShiftMultiplier"
                  label="Hệ số lương ca đêm"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập hệ số lương ca đêm",
                    },
                  ]}
                >
                  <InputNumber
                    min={1}
                    className="financial-page-input-number"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Divider />

            <Title level={5}>Chi phí dịch vụ</Title>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="cleaningFee"
                  label="Dọn dẹp nhà (VND/giờ)"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập chi phí dọn dẹp nhà",
                    },
                  ]}
                >
                  <InputNumber min={0} className="financial-page-input-number" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="movingFee"
                  label="Dọn nhà (VND/giờ)"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập chi phí dọn nhà",
                    },
                  ]}
                >
                  <InputNumber min={0} className="financial-page-input-number" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="disinfectingFee"
                  label="Khử khuẩn (VND/giờ)"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập chi phí khử khuẩn",
                    },
                  ]}
                >
                  <InputNumber min={0} className="financial-page-input-number" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="ironingFee"
                  label="Là quần áo (VND/giờ)"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập chi phí là quần áo",
                    },
                  ]}
                >
                  <InputNumber min={0} className="financial-page-input-number" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="cookingFee"
                  label="Nấu ăn (VND/giờ)"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập chi phí nấu ăn",
                    },
                  ]}
                >
                  <InputNumber min={0} className="financial-page-input-number" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="officeCleaningFee"
                  label="Dọn dẹp văn phòng (VND/giờ)"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập chi phí dọn dẹp văn phòng",
                    },
                  ]}
                >
                  <InputNumber min={0} className="financial-page-input-number" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item style={{ marginTop: "20px" }}>
              <Button
                type="primary"
                htmlType="submit"
                className="financial-page-button"
              >
                Lưu thay đổi
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>

      <div className="financial-page-wrapper">
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

export default FinancialPage;