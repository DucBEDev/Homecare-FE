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
  Modal,
  Input,
  Select,
} from "antd";
import axios from "axios";
import "./FinancePage.css";
import NotificationComponent from "../../components/NotificationComponent/NotificationComponent";

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const FinancialPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(null);
  const [serviceCoefficients, setServiceCoefficients] = useState(null);
  const [maidCoefficients, setMaidCoefficients] = useState(null);
  const [otherCoefficients, setOtherCoefficients] = useState(null);
  const [dataFetched, setDataFetched] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCoefficient, setSelectedCoefficient] = useState(null);

  const [modalForm] = Form.useForm();
  const [updateLoading, setUpdateLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}admin/costFactors`
      );
      const costFactorLists = response.data.costFactorLists;
      console.log(costFactorLists);

      setServiceCoefficients(
        costFactorLists.find((e) => e.title === "Hệ số lương cho dịch vụ")
      );
      setMaidCoefficients(
        costFactorLists.find(
          (e) => e.title === "Hệ số lương cho người giúp việc"
        )
      );
      setOtherCoefficients(
        costFactorLists.find((e) => e.title === "Hệ số khác")
      );

      setDataFetched(true);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
      message.error("Lỗi khi lấy dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const serviceCoefficientsToSend =
        serviceCoefficients.newCoefficientList.map((item) => ({
          title: item.title,
          value: values[item.title],
        }));
      const maidCoefficientsToSend = maidCoefficients.newCoefficientList.map(
        (item) => ({
          title: item.title,
          value: values[item.title],
        })
      );
      const otherCoefficientsToSend = otherCoefficients.newCoefficientList.map(
        (item) => ({
          title: item.title,
          value: values[item.title],
        })
      );

      const dataToSend = {
        costFactorLists: [
          {
            title: "Hệ số lương cho dịch vụ",
            newCoefficientList: serviceCoefficientsToSend,
          },
          {
            title: "Hệ số lương cho người giúp việc",
            newCoefficientList: maidCoefficientsToSend,
          },
          { title: "Hệ số khác", newCoefficientList: otherCoefficientsToSend },
        ],
      };

      console.log("dataToSend", dataToSend);

      await axios.patch(
        `${process.env.REACT_APP_API_URL}admin/costFactors/update`,
        dataToSend,
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

  useEffect(() => {
    if (dataFetched) {
      const formValues = {};
      if (serviceCoefficients?.newCoefficientList) {
        serviceCoefficients.newCoefficientList.forEach((item) => {
          formValues[item.title] = item.value;
        });
      }
      if (maidCoefficients?.newCoefficientList) {
        maidCoefficients.newCoefficientList.forEach((item) => {
          formValues[item.title] = item.value;
        });
      }
      if (otherCoefficients?.newCoefficientList) {
        otherCoefficients.newCoefficientList.forEach((item) => {
          formValues[item.title] = item.value;
        });
      }
      form.setFieldsValue(formValues);
    }
  }, [
    dataFetched,
    form,
    serviceCoefficients,
    maidCoefficients,
    otherCoefficients,
  ]);

  const showModal = (coefficient, type) => {
    setSelectedCoefficient({ ...coefficient, type });
    setModalVisible(true);
    modalForm.setFieldsValue({
      modalTitle: coefficient.title,
      modalDescription: coefficient.description,
      modalValue: coefficient.value,
      modalStatus: coefficient.status,
    });
  };

  const handleOk = () => {
    setModalVisible(false);
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  const handleUpdateInfo = async (coefficient) => {
    setUpdateLoading(true);
    // Lấy type và costFactorListTitle từ coefficient truyền vào
    const type = coefficient.type;
    const costFactorListTitle = coefficient.costFactorListTitle;
    try {
      const values = await modalForm.validateFields();

      const dataToSend = {
        title: values.modalTitle,
        description: values.modalDescription,
        value: values.modalValue,
        status: values.modalStatus,
      };
      console.log(dataToSend);
      const response = await axios.patch(
        `${process.env.REACT_APP_API_URL}admin/costFactors/edit/${coefficient._id}`,
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
          description: "Cập nhật thông tin hệ số thành công",
        });
        fetchData();
      } else {
        setShowNotification({
          status: "error",
          message: "Thất bại",
          description: "Cập nhật thông tin hệ số thất bại",
        });
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error);
      setShowNotification({
        status: "error",
        message: "Thất bại",
        description: "Lỗi khi cập nhật hệ số: " + error.message,
      });
    } finally {
      setUpdateLoading(false);
      setModalVisible(false);
      setTimeout(() => setShowNotification(null), 3000);
    }
  };

  const handleDeleteCoefficient = async (coefficient) => {
    const type = coefficient.type;
    try {
      Modal.confirm({
        title: "Xác nhận xóa",
        content: `Bạn có chắc chắn muốn xóa hệ số "${coefficient.title}" không?`,
        okText: "Xóa",
        okType: "danger",
        cancelText: "Hủy",
        onOk: async () => {
          const response = await axios.delete(
            `${process.env.REACT_APP_API_URL}admin/costFactors/delete/${coefficient._id}`
          );

          if (response.status === 200) {
            setShowNotification({
              status: "success",
              message: "Thành công",
              description: `Xóa hệ số "${coefficient.title}" thành công`,
            });

            fetchData();
          } else {
            setShowNotification({
              status: "error",
              message: "Thất bại",
              description: `Xóa hệ số "${coefficient.title}" thất bại`,
            });
          }
        },
      });
    } catch (error) {
      console.error("Lỗi khi xóa hệ số:", error);
      setShowNotification({
        status: "error",
        message: "Thất bại",
        description: "Lỗi khi xóa hệ số: " + error.message,
      });
    } finally {
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
          >
            <Row
              gutter={24}
              style={{ display: "flex", justifyContent: "space-around" }}
            >
              {/* serviceCoefficients */}
              <Col
                xs={24}
                sm={24}
                md={12}
                lg={8}
                xl={7}
                className="scrollable-column"
                style={{ maxHeight: "400px", overflowY: "auto" }}
              >
                <Title
                  style={{
                    textAlign: "center",
                    marginTop: "12px",
                    marginBottom: "-2px",
                  }}
                  level={5}
                >
                  Hệ số dịch vụ
                </Title>
                <Divider
                  orientation="center"
                  style={{ textAlign: "center" }}
                  className="ant-divider-title"
                >
                  <button
                    style={{ width: "40px", height: "20px", fontSize: "10px" }}
                  >
                    +
                  </button>
                </Divider>
                {/* Display column headers */}
                <Row gutter={[8, 8]} style={{ marginBottom: "8px" }}>
                  <Col className="header-col" style={{ flex: 3 }}>
                    Tiêu đề
                  </Col>
                  <Col className="header-col" style={{ flex: 2 }}>
                    Giá trị
                  </Col>
                  <Col className="header-col" style={{ flex: 2 }}>
                    Trạng thái
                  </Col>
                  <Col
                    className="header-col"
                    style={{ flex: 3, marginRight: "-18px" }}
                  >
                    Chức năng
                  </Col>
                </Row>
                {serviceCoefficients &&
                  serviceCoefficients.newCoefficientList.map((coefficient) => (
                    <Row gutter={[8, 8]} key={coefficient._id}>
                      <Col
                        className="title-col"
                        style={{ flex: 3, wordWrap: "break-word" }}
                      >
                        {coefficient.title}
                      </Col>
                      <Col style={{ flex: 2 }}>
                        <Form.Item
                          name={coefficient.title}
                          rules={[
                            {
                              required: true,
                              message: `Vui lòng nhập ${coefficient.title}`,
                            },
                          ]}
                        >
                          <InputNumber
                            min={0}
                            controls={false}
                            className="financial-page-input-number custom-input-number"
                          />
                        </Form.Item>
                      </Col>
                      <Col style={{ flex: 2, wordWrap: "break-word" }}>
                        {coefficient.status}
                      </Col>
                      <Col style={{ flex: 3 }}>
                        <Button
                          type="primary"
                          size="small"
                          onClick={() =>
                            showModal(coefficient, "serviceCoefficients")
                          }
                          style={{ margin: "0 4px" }}
                        >
                          Chi tiết
                        </Button>
                        <Button
                          type="primary"
                          size="small"
                          style={{ background: "#ee4352" }}
                          onClick={() => handleDeleteCoefficient(coefficient)}
                        >
                          Xóa
                        </Button>
                      </Col>
                    </Row>
                  ))}
              </Col>
              <Divider type="vertical" style={{ height: "auto" }} />

              {/* maidCoefficients */}
              <Col
                xs={24}
                sm={24}
                md={12}
                lg={8}
                xl={7}
                className="scrollable-column"
                style={{ maxHeight: "400px", overflowY: "auto" }}
              >
                <Title
                  style={{
                    textAlign: "center",
                    marginTop: "12px",
                    marginBottom: "-2px",
                  }}
                  level={5}
                >
                  Hệ số người giúp việc
                </Title>
                <Divider
                  orientation="center"
                  style={{ textAlign: "center" }}
                  className="ant-divider-title"
                >
                  <button
                    style={{ width: "40px", height: "20px", fontSize: "10px" }}
                  >
                    +
                  </button>
                </Divider>
                {/* Display column headers */}
                <Row gutter={[8, 8]} style={{ marginBottom: "8px" }}>
                  <Col className="header-col" style={{ flex: 3 }}>
                    Tiêu đề
                  </Col>
                  <Col className="header-col" style={{ flex: 2 }}>
                    Giá trị
                  </Col>
                  <Col className="header-col" style={{ flex: 2 }}>
                    Trạng thái
                  </Col>
                  <Col
                    className="header-col"
                    style={{ flex: 3, marginRight: "-18px" }}
                  >
                    Chức năng
                  </Col>
                </Row>
                {maidCoefficients &&
                  maidCoefficients.newCoefficientList.map((coefficient) => (
                    <Row gutter={[8, 8]} key={coefficient._id}>
                      <Col
                        className="title-col"
                        style={{ flex: 3, wordWrap: "break-word" }}
                      >
                        {coefficient.title}
                      </Col>
                      <Col style={{ flex: 2 }}>
                        <Form.Item
                          name={coefficient.title}
                          rules={[
                            {
                              required: true,
                              message: `Vui lòng nhập ${coefficient.title}`,
                            },
                          ]}
                        >
                          <InputNumber
                            min={0}
                            className="financial-page-input-number custom-input-number"
                            controls={false}
                          />
                        </Form.Item>
                      </Col>
                      <Col style={{ flex: 2, wordWrap: "break-word" }}>
                        {coefficient.status}
                      </Col>
                      <Col style={{ flex: 3 }}>
                        <Button
                          type="primary"
                          size="small"
                          onClick={() =>
                            showModal(coefficient, "maidCoefficients")
                          }
                          style={{ margin: "0 4px" }}
                        >
                          Chi tiết
                        </Button>

                        <Button
                          style={{ background: "#ee4352" }}
                          type="primary"
                          size="small"
                          onClick={() => handleDeleteCoefficient(coefficient)}
                        >
                          Xóa
                        </Button>
                      </Col>
                    </Row>
                  ))}
              </Col>

              <Divider type="vertical" style={{ height: "auto" }} />

              {/* otherCoefficients */}
              <Col
                xs={24}
                sm={24}
                md={12}
                lg={8}
                xl={7}
                className="scrollable-column"
                style={{ maxHeight: "400px", overflowY: "auto" }}
              >
                <Title
                  style={{
                    textAlign: "center",
                    marginTop: "12px",
                    marginBottom: "-2px",
                  }}
                  level={5}
                >
                  Hệ số khác
                </Title>
                <Divider
                  orientation="center"
                  style={{ textAlign: "center" }}
                  className="ant-divider-title"
                >
                  <button
                    style={{ width: "40px", height: "20px", fontSize: "10px" }}
                  >
                    +
                  </button>
                </Divider>
                {/* Display column headers */}
                <Row gutter={[8, 8]} style={{ marginBottom: "8px" }}>
                  <Col className="header-col" style={{ flex: 3 }}>
                    Tiêu đề
                  </Col>
                  <Col className="header-col" style={{ flex: 2 }}>
                    Giá trị
                  </Col>
                  <Col className="header-col" style={{ flex: 2 }}>
                    Trạng thái
                  </Col>
                  <Col
                    className="header-col"
                    style={{ flex: 3, marginRight: "-18px" }}
                  >
                    Chức năng
                  </Col>
                </Row>
                {otherCoefficients &&
                  otherCoefficients.newCoefficientList.map((coefficient) => (
                    <Row gutter={[8, 8]} key={coefficient._id}>
                      <Col
                        className="title-col"
                        style={{ flex: 3, wordWrap: "break-word" }}
                      >
                        {coefficient.title}
                      </Col>
                      <Col style={{ flex: 2 }}>
                        <Form.Item
                          name={coefficient.title}
                          rules={[
                            {
                              required: true,
                              message: `Vui lòng nhập ${coefficient.title}`,
                            },
                          ]}
                        >
                          <InputNumber
                            min={coefficient.min || 0}
                            controls={false}
                            className="financial-page-input-number custom-input-number"
                          />
                        </Form.Item>
                      </Col>
                      <Col style={{ flex: 2, wordWrap: "break-word" }}>
                        {coefficient.status}
                      </Col>
                      <Col style={{ flex: 3 }}>
                        <Button
                          type="primary"
                          size="small"
                          onClick={() =>
                            showModal(coefficient, "otherCoefficients")
                          }
                          style={{ margin: "0 4px" }}
                        >
                          Chi tiết
                        </Button>
                        <Button
                          type="primary"
                          size="small"
                          style={{ background: "#ee4352" }}
                          onClick={() => handleDeleteCoefficient(coefficient)}
                        >
                          Xóa
                        </Button>
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

      <Modal
        className="custom-modal"
        title={selectedCoefficient?.title || "Chi tiết"}
        open={modalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={updateLoading}
            onClick={() => handleUpdateInfo(selectedCoefficient)}
          >
            Cập nhật
          </Button>,
        ]}
      >
        <Form form={modalForm} layout="vertical">
          <div className="popup-content">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item
                  name="modalTitle"
                  label="Tiêu đề"
                  rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="modalValue"
                  label="Giá trị"
                  rules={[{ required: true, message: "Vui lòng nhập giá trị" }]}
                >
                  <InputNumber
                    style={{ width: "100%", height: "32px" }}
                    className="custom-input-number"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="modalStatus"
                  label="Trạng thái"
                  rules={[
                    { required: true, message: "Vui lòng chọn trạng thái" },
                  ]}
                >
                  <Select placeholder="Chọn trạng thái">
                    <Option value="active">Hoạt động</Option>
                    <Option value="inactive">Không hoạt động</Option>
                    {/* Thêm các option khác nếu cần */}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  name="modalDescription"
                  label="Mô tả"
                  rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
                >
                  <TextArea rows={4} />
                </Form.Item>
              </Col>
            </Row>
          </div>
        </Form>
      </Modal>

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
