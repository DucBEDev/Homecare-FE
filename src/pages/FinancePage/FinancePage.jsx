import React, { useState, useEffect, useCallback } from "react";
import {
  Form,
  InputNumber,
  Button,
  Card,
  Row,
  Col,
  Typography,
  Divider,
  Modal,
  Input,
  Select,
  message,
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
  const [addLoading, setAddLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(null);
  const [serviceCoefficients, setServiceCoefficients] = useState(null);
  const [maidCoefficients, setMaidCoefficients] = useState(null);
  const [otherCoefficients, setOtherCoefficients] = useState(null);
  const [dataFetched, setDataFetched] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCoefficient, setSelectedCoefficient] = useState(null);
  const [costFactorLists, setCostFactorLists] = useState(null);
  const [modalForm] = Form.useForm();
  const [updateLoading, setUpdateLoading] = useState(false);

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [addModalForm] = Form.useForm();
  const [selectedCoefficientType, setSelectedCoefficientType] = useState(null);

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [coefficientToDelete, setCoefficientToDelete] = useState(null);

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}admin/costFactors`
      );
      setCostFactorLists(response.data.costFactorLists);
      setServiceCoefficients(
        response.data.costFactorLists.find(
          (e) => e.title === "Hệ số lương cho dịch vụ"
        )
      );
      setMaidCoefficients(
        response.data.costFactorLists.find(
          (e) => e.title === "Hệ số lương cho người giúp việc"
        )
      );
      setOtherCoefficients(
        response.data.costFactorLists.find((e) => e.title === "Hệ số khác")
      );

      setDataFetched(true);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu phân quyền:", error);
      message.error("Lỗi khi lấy dữ liệu phân quyền");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  useEffect(() => {
    if (dataFetched && costFactorLists) {
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
    costFactorLists,
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

  const showAddModal = (type) => {
    setSelectedCoefficientType(type);
    setAddModalVisible(true);
    addModalForm.resetFields();
  };

  const handleAddModalCancel = () => {
    setAddModalVisible(false);
  };

  const showDeleteConfirm = (coefficient) => {
    setCoefficientToDelete(coefficient);
    setDeleteModalVisible(true);
  };

  const hideDeleteConfirm = () => {
    setDeleteModalVisible(false);
    setCoefficientToDelete(null);
  };

  const handleAddCoefficient = async () => {
    try {
      setAddLoading(true);
      const values = await addModalForm.validateFields();
      let dataApplyTo = "";
      if (selectedCoefficientType === "serviceCoefficients") {
        dataApplyTo = "service";
      } else if (selectedCoefficientType === "maidCoefficients") {
        dataApplyTo = "helper";
      } else if (selectedCoefficientType === "otherCoefficients") {
        dataApplyTo = "other";
      }

      const dataToSend = {
        title: values.modalTitle,
        description: values.modalDescription,
        value: values.modalValue,
        status: values.modalStatus,
        applyTo: dataApplyTo,
      };

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}admin/costFactors/create`,
        dataToSend,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status >= 200 && response.status < 300) {
        setShowNotification({
          status: "success",
          message: "Thành công",
          description: "Thêm mới hệ số thành công",
        });
        fetchPermissions();
        setAddModalVisible(false);
      } else {
        setShowNotification({
          status: "error",
          message: "Thất bại",
          description:
            "Thêm mới hệ số thất bại: " +
            (response.data.message || "Lỗi không xác định"),
        });
      }
    } catch (error) {
      console.error("Lỗi khi thêm mới:", error);
      setShowNotification({
        status: "error",
        message: "Thất bại",
        description: "Lỗi khi thêm mới hệ số: " + error.message,
      });
    } finally {
      setAddLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!coefficientToDelete) return;

    try {
      setLoading(true);
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}admin/costFactors/delete/${coefficientToDelete._id}`
      );

      if (response.data.success) {
        setShowNotification({
          status: "success",
          message: "Thành công",
          description: `Xóa hệ số "${coefficientToDelete.title}" thành công`,
        });
        fetchPermissions();
      } else {
        setShowNotification({
          status: "error",
          message: "Thất bại",
          description: `Xóa hệ số "${coefficientToDelete.title}" thất bại`,
        });
      }
    } catch (error) {
      console.error("Lỗi khi xóa hệ số:", error);
      setShowNotification({
        status: "error",
        message: "Thất bại",
        description: "Lỗi khi xóa hệ số: " + error.message,
      });
    } finally {
      setLoading(false);
      hideDeleteConfirm();
      setTimeout(() => setShowNotification(null), 3000);
    }
  };

  const handleUpdateInfo = async (coefficient) => {
    setUpdateLoading(true);

    try {
      const values = await modalForm.validateFields();
      const foundCostFactorList = costFactorLists?.find((list) => {
        return list.newCoefficientList.some(
          (item) => item.title === values.modalTitle
        );
      });

      const dataApplyTo = foundCostFactorList
        ? foundCostFactorList.applyTo
        : "";
      const dataToSend = {
        title: values.modalTitle,
        description: values.modalDescription,
        value: values.modalValue,
        status: values.modalStatus,
        applyTo: dataApplyTo,
      };

      const response = await axios.patch(
        `${process.env.REACT_APP_API_URL}admin/costFactors/edit/${coefficient._id}`,
        dataToSend,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.data.success) {
        setShowNotification({
          status: "success",
          message: "Thành công",
          description: "Cập nhật thông tin hệ số thành công",
        });
        fetchPermissions();
      } else {
        setShowNotification({
          status: "error",
          message: "Thất bại",
          description:
            "Cập nhật thông tin hệ số thất bại" +
            (response.data.message || "Lỗi không xác định"),
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

  const handleDeleteCoefficient = (coefficient) => {
    showDeleteConfirm(coefficient);
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
          <Form form={form} layout="vertical" className="financial-page-form">
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
                style={{ maxHeight: "100%", marginLeft: "20px" }}
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
                    onClick={() => showAddModal("serviceCoefficients")}
                  >
                    +
                  </button>
                </Divider>
                {/* Display column headers */}
                <Row gutter={[8, 8]} style={{ marginBottom: "8px" }}>
                  <Col className="header-col" style={{ flex: 4,  fontWeight: "500", marginBottom: "8px" }}>
                    Tiêu đề
                  </Col>
                  <Col className="header-col" style={{ flex: 4,  fontWeight: "500", marginBottom: "8px" }}>
                    Giá trị
                  </Col>
                  <Col className="header-col" style={{ flex: 4,  fontWeight: "500", marginBottom: "8px" }}>
                    Chức năng
                  </Col>
                </Row>
                {serviceCoefficients &&
                  serviceCoefficients.newCoefficientList.map((coefficient) => (
                    <Row gutter={[8, 8]} key={coefficient._id}>
                      <Col
                        className="title-col"
                        style={{ flex: 4, wordWrap: "break-word" }}
                      >
                        {coefficient.title}
                      </Col>
                      <Col style={{ flex: 4 }}>
                        <Form.Item
                          name={coefficient.title}
                          validateTrigger={["onBlur", "onChange"]}
                          rules={[
                            {
                              required: true,
                              message: `Vui lòng nhập ${coefficient.title}`,
                            },
                          ]}
                        >
                          <InputNumber
                            min={0}
                            step={0.1}
                            style={{ width: "100%" }}
                            className="financial-page-input-number custom-input-number"
                          />
                        </Form.Item>
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
                      <Col style={{ flex: 1, wordWrap: "break-word" }}>
                        <span
                          className="status-dot"
                          style={{
                            backgroundColor:
                              coefficient.status === "active"
                                ? "#53d768"
                                : "#ee4352",
                          }}
                        />
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
                style={{ maxHeight: "100%" }}
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
                    onClick={() => showAddModal("maidCoefficients")}
                  >
                    +
                  </button>
                </Divider>
                {/* Display column headers */}
                <Row gutter={[8, 8]} style={{ marginBottom: "8px" }}>
                  <Col className="header-col" style={{ flex: 3,  fontWeight: "500", marginBottom: "8px" }}>
                    Tiêu đề
                  </Col>
                  <Col className="header-col" style={{ flex: 4,  fontWeight: "500", marginBottom: "8px" }}>
                    Giá trị
                  </Col>
                  <Col className="header-col" style={{ flex: 4,  fontWeight: "500", marginBottom: "8px"}}>
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
                      <Col style={{ flex: 4 }}>
                        <Form.Item
                          name={coefficient.title}
                          validateTrigger={["onBlur", "onChange"]}
                          rules={[
                            {
                              required: true,
                              message: `Vui lòng nhập ${coefficient.title}`,
                            },
                          ]}
                        >
                          <InputNumber
                            min={0}
                            step={0.1}
                            style={{ width: "100%" }}
                            className="financial-page-input-number custom-input-number"
                          />
                        </Form.Item>
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
                      <Col style={{ flex: 1, wordWrap: "break-word" }}>
                        <span
                          className="status-dot"
                          style={{
                            backgroundColor:
                              coefficient.status === "active"
                                ? "#53d768"
                                : "#ee4352",
                          }}
                        />
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
                style={{ maxHeight: "100%" }}
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
                    onClick={() => showAddModal("otherCoefficients")}
                  >
                    +
                  </button>
                </Divider>
                {/* Display column headers */}
                <Row gutter={[8, 8]} style={{ marginBottom: "8px" }}>
                  <Col className="header-col" style={{ flex: 4,  fontWeight: "500", marginBottom: "8px" }}>
                    Tiêu đề
                  </Col>
                  <Col className="header-col" style={{ flex: 4,  fontWeight: "500", marginBottom: "8px" }}>
                    Giá trị
                  </Col>
                  <Col className="header-col" style={{ flex: 4,  fontWeight: "500", marginBottom: "8px" }}>
                    Chức năng
                  </Col>
                </Row>
                {otherCoefficients &&
                  otherCoefficients.newCoefficientList.map((coefficient) => (
                    <Row gutter={[8, 8]} key={coefficient._id}>
                      <Col
                        className="title-col"
                        style={{ flex: 4, wordWrap: "break-word" }}
                      >
                        {coefficient.title}
                      </Col>
                      <Col style={{ flex: 4 }}>
                        <Form.Item
                          name={coefficient.title}
                          validateTrigger={["onBlur", "onChange"]}
                          rules={[
                            {
                              required: true,
                              message: `Vui lòng nhập ${coefficient.title}`,
                            },
                          ]}
                        >
                          <InputNumber
                            step={0.1}
                            min={coefficient.min || 0}
                            style={{ width: "100%" }}
                            className="financial-page-input-number custom-input-number"
                          />
                        </Form.Item>
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
                      <Col style={{ flex: 1, wordWrap: "break-word" }}>
                        <span
                          className="status-dot"
                          style={{
                            backgroundColor:
                              coefficient.status === "active"
                                ? "#53d768"
                                : "rgb(210, 45, 45)",
                          }}
                        />
                      </Col>
                    </Row>
                  ))}
              </Col>
            </Row>
          </Form>
        </Card>
      </div>

      {/* Modal */}
      <Modal
        className="custom-modal"
        title={selectedCoefficient?.title || "Chi tiết"}
        open={modalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[
          <Button
            key="cancel"
            danger
            type="primary"
            className="delete-button"
            onClick={handleCancel}
          >
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
                    step={0.1}
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

      <Modal
        title="Thêm mới hệ số"
        open={addModalVisible}
        onOk={handleAddCoefficient}
        onCancel={handleAddModalCancel}
        okButtonProps={{ loading: addLoading }}
        footer={[
          <Button key="cancel" onClick={handleAddModalCancel}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={addLoading}
            onClick={handleAddCoefficient}
          >
            Thêm mới
          </Button>,
        ]}
      >
        <Form form={addModalForm} layout="vertical">
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
                    step={0.1}
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

      {/* Modal xác nhận xóa */}
      <Modal
        title="Xác nhận xóa hệ số"
        visible={deleteModalVisible}
        onCancel={hideDeleteConfirm}
        footer={[
          <Button
            key="delete"
            danger
            type="primary"
            onClick={handleConfirmDelete}
            className="delete-button"
          >
            Đồng ý
          </Button>,
          <Button key="cancel" onClick={hideDeleteConfirm}>
            Hủy
          </Button>,
        ]}
        width={600}
      >
        <div className="popup-content">
          <div className="info-section">
            <p style={{ marginBottom: 20, fontWeight: "bold" }}>
              Bạn có chắc chắn muốn xóa hệ số "{coefficientToDelete?.title}"?
            </p>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div className="info-item">
                  <span style={{
                      whiteSpace: "nowrap",
                    }}>Tiêu đề:</span>
                  <span>{coefficientToDelete?.title}</span>
                </div>
              </Col>
              <Col span={12}>
                <div className="info-item">
                  <span>Trạng thái:</span>
                  <span>{coefficientToDelete?.status === "active" ? "Hoạt động" : "Không hoạt động"}</span>
                </div>
              </Col>
              <Col span={12}>
                <div className="info-item">
                  <span>Giá trị:</span>
                  <span>{coefficientToDelete?.value}</span>
                </div>
              </Col>
              <Col span={12}></Col>
              <Col span={24} style={{marginLeft: "2px"}}>
                <div
                  className="info-item"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      whiteSpace: "nowrap",
                    }}
                  >
                    Mô Tả:
                  </span>
                  <span
                    style={{
                      width: "84%",
                      wordBreak: "break-word",
                    }}
                  >
                     {coefficientToDelete?.description}
                  </span>
                </div>
              </Col>
            </Row>
          </div>
        </div>
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
