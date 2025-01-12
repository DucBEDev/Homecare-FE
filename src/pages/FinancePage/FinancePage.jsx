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
  Divider,
} from "antd";
import axios from "axios";
import "./FinancePage.css";
import NotificationComponent from "../../components/NotificationComponent/NotificationComponent";

const { Title } = Typography;

const FinancialPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(null);
  const [serviceCoefficients, setServiceCoefficients] = useState([]);
  const [maidCoefficients, setMaidCoefficients] = useState([]);
  const [otherCoefficients, setOtherCoefficients] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Lấy hệ số dịch vụ
        const serviceResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}admin/serviceCoefficients`
        );
        setServiceCoefficients(serviceResponse.data.serviceCoefficients);

        // Lấy hệ số người giúp việc
        const maidResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}admin/maidCoefficients`
        );
        setMaidCoefficients(maidResponse.data.maidCoefficients);

        // Lấy hệ số khác
        const otherResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}admin/otherCoefficients`
        );
        setOtherCoefficients(otherResponse.data.otherCoefficients);

        // Set giá trị mặc định cho form (nếu cần)
        // form.setFieldsValue({
        //   serviceCoefficients: {
        //     ...
        //   },
        //   maidCoefficients: {
        //     ...
        //   },
        //   otherCoefficients: {
        //      ...
        //   }
        // });
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
        message.error("Lỗi khi lấy dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const dataToSend = {
        serviceCoefficients: values.serviceCoefficients,
        maidCoefficients: values.maidCoefficients,
        otherCoefficients: values.otherCoefficients,
      };

      console.log("dataToSend", dataToSend);

      // Cập nhật hệ số dịch vụ
      await axios.patch(
        `${process.env.REACT_APP_API_URL}admin/serviceCoefficients/update`,
        dataToSend.serviceCoefficients,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Cập nhật hệ số người giúp việc
      await axios.patch(
        `${process.env.REACT_APP_API_URL}admin/maidCoefficients/update`,
        dataToSend.maidCoefficients,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      // Cập nhật hệ số khác
      await axios.patch(
        `${process.env.REACT_APP_API_URL}admin/otherCoefficients/update`,
        dataToSend.otherCoefficients,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setShowNotification({
        status: "success",
        message: "Thành công",
        description: "Cập nhật thông tin hệ số tài chính thành công",
      });
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin hệ số tài chính:", error);
      setShowNotification({
        status: "error",
        message: "Thất bại",
        description:
          "Lỗi khi cập nhật thông tin hệ số tài chính: " + error.message,
      });
    } finally {
      setLoading(false);
      setTimeout(() => setShowNotification(null), 3000);
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
            initialValues={{
              serviceCoefficients: serviceCoefficients.reduce((acc, curr) => {
                acc[curr.key] = curr.value;
                return acc;
              }, {}),
              maidCoefficients: maidCoefficients.reduce((acc, curr) => {
                acc[curr.key] = curr.value;
                return acc;
              }, {}),
              otherCoefficients: otherCoefficients.reduce((acc, curr) => {
                acc[curr.key] = curr.value;
                return acc;
              }, {}),
            }}
          >
            <Row gutter={16}>
              <Col span={8} className="scrollable-column">
                <Divider orientation="left">
                  <Title level={5}>Hệ số dịch vụ</Title>
                </Divider>
                {serviceCoefficients.map((coefficient) => (
                  <Row gutter={16} key={coefficient._id}>
                    <Col span={24}>
                      <Form.Item
                        name={["serviceCoefficients", coefficient.key]}
                        label={coefficient.label}
                        rules={[
                          {
                            required: true,
                            message: `Vui lòng nhập ${coefficient.label}`,
                          },
                        ]}
                      >
                        <InputNumber
                          min={0}
                          className="financial-page-input-number custom-input-number"
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
                ))}
              </Col>
              <Divider type="vertical" style={{ height: "auto" }} />

              <Col span={8} className="scrollable-column">
                <Divider orientation="left">
                  <Title level={5}>Hệ số người giúp việc</Title>
                </Divider>
                {maidCoefficients.map((coefficient) => (
                  <Row gutter={16} key={coefficient._id}>
                    <Col span={24}>
                      <Form.Item
                        name={["maidCoefficients", coefficient.key]}
                        label={coefficient.label}
                        rules={[
                          {
                            required: true,
                            message: `Vui lòng nhập ${coefficient.label}`,
                          },
                        ]}
                      >
                        <InputNumber
                          min={0}
                          className="financial-page-input-number custom-input-number"
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
                ))}
              </Col>

              <Divider type="vertical" style={{ height: "auto" }} />

              <Col span={7} className="scrollable-column">
                <Divider orientation="left">
                  <Title level={5}>Hệ số khác</Title>
                </Divider>
                {otherCoefficients.map((coefficient) => (
                  <Row gutter={16} key={coefficient._id}>
                    <Col span={24}>
                      <Form.Item
                        name={["otherCoefficients", coefficient.key]}
                        label={coefficient.label}
                        rules={[
                          {
                            required: true,
                            message: `Vui lòng nhập ${coefficient.label}`,
                          },
                        ]}
                      >
                        <InputNumber
                          min={coefficient.min}
                          max={coefficient.max}
                          className="financial-page-input-number custom-input-number"
                          formatter={(value) =>
                            coefficient.key === "tipRate"
                              ? `${value}%`
                              : `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                          }
                          parser={(value) =>
                            coefficient.key === "tipRate"
                              ? value.replace("%", "")
                              : value.replace(/\./g, "")
                          }
                          style={{
                            height: "40px",
                            display: "flex",
                            alignItems: "center",
                          }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                ))}
              </Col>
            </Row>

            <Form.Item style={{ marginTop: "20px" }}>
              <Button
                type="primary"
                htmlType="submit"
                className="financial-page-button"
                loading={loading}
              >
                Lưu thay đổi
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>

      {/* Notification */}
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
