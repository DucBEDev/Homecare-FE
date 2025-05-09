import React, { useState, useEffect, useRef } from "react";
import {
  Table,
  Form,
  Card,
  Checkbox,
  Button,
  message,
  Modal,
  Input,
  Divider,
  Row,
  Col,
} from "antd";
import { DownOutlined, RightOutlined, SaveOutlined, SettingOutlined } from "@ant-design/icons";
import axios from "axios";
import "./PermissionPage.css";
import NotificationComponent from "../../components/NotificationComponent/NotificationComponent";

const PermissionPage = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(null);
  const [changes, setChanges] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const confirmRef = useRef(null);
  const [form] = Form.useForm();
  const [record, setRecord] = useState(null); //Thêm state record để lưu trữ object (chỉnh sửa)
  const [expandedFeatures, setExpandedFeatures] = useState({}); // Thêm state để quản lý tình trạng mở/đóng

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}admin/roles`
      );
      setRoles(response.data.records);
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

  const features = [
    {
      name: "Dashboard",
      code: "dashboard",
      actions: ["view"],
    },
    {
      name: "Quản lý người giúp việc",
      code: "helpers",
      actions: ["view", "create", "edit", "delete"],
    },
    {
      name: "Quản lý nhân viên",
      code: "staffs",
      actions: ["view", "create", "edit", "delete"],
    },
    {
      name: "Quản lý khách hàng",
      code: "customers",
      actions: ["view", "create", "edit", "delete"],
    },
    {
      name: "Quản lý dịch vụ",
      code: "services",
      actions: ["view", "create", "edit", "delete"],
    },
    {
      name: "Quản lý blogs",
      code: "blogs",
      actions: ["view", "create", "edit", "delete"],
    },
    {
      name: "Hệ số giá",
      code: "costCoefficients",
      actions: ["view", "create", "edit", "delete"],
    },
    {
      name: "Cài đặt chung",
      code: "generalSetting",
      actions: ["view", "edit"],
    },
    {
      name: "Chính sách",
      code: "policies",
      actions: ["view", "create", "edit", "delete"],
    },
    {
      name: "Quản lý phân quyền",
      code: "roles",
      actions: ["view", "create", "edit", "delete"],
    },
  ];

  // Thêm hàm để xử lý việc mở/thu gọn tính năng
  const toggleFeatureExpand = (featureName) => {
    setExpandedFeatures((prev) => ({
      ...prev,
      [featureName]: !prev[featureName],
    }));
  };

  // Thêm hàm để chọn tất cả quyền cho một tính năng và một vai trò
  const handleFeatureAllPermissions = (roleId, featureCode, checked) => {
    const feature = features.find((f) => f.code === featureCode);
    if (!feature) return;

    setChanges((prevChanges) => {
      const roleChanges = [...(prevChanges[roleId] || [])];

      // Xử lý cho từng action trong tính năng
      feature.actions.forEach((action) => {
        const permissionCode = `${featureCode}_${action}`;
        const existingIndex = roleChanges.findIndex(
          (p) => p.code === permissionCode
        );

        if (existingIndex >= 0) {
          roleChanges[existingIndex].checked = checked;
        } else {
          roleChanges.push({ code: permissionCode, checked });
        }
      });

      return { ...prevChanges, [roleId]: roleChanges };
    });
  };

  // Kiểm tra nếu tất cả các quyền của một tính năng đã được chọn
  const isFeatureFullyChecked = (roleId, featureCode) => {
    const feature = features.find((f) => f.code === featureCode);
    if (!feature) return false;

    const role = roles.find((r) => r._id === roleId);
    if (!role) return false;

    // Kiểm tra từng action trong feature
    return feature.actions.every((action) => {
      const permissionCode = `${featureCode}_${action}`;
      const changedPermission = changes[roleId]?.find(
        (p) => p.code === permissionCode
      );

      // Nếu có thay đổi, kiểm tra giá trị checked
      if (changedPermission !== undefined) {
        return changedPermission.checked;
      }

      // Nếu không có thay đổi, kiểm tra trong permissions hiện tại
      return role.permissions.includes(permissionCode);
    });
  };

  // Kiểm tra nếu ít nhất một quyền của tính năng được chọn (để hiển thị indeterminate)
  const isFeaturePartiallyChecked = (roleId, featureCode) => {
    const feature = features.find((f) => f.code === featureCode);
    if (!feature) return false;

    const role = roles.find((r) => r._id === roleId);
    if (!role) return false;

    // Nếu tất cả quyền đã được chọn, trả về false
    if (isFeatureFullyChecked(roleId, featureCode)) return false;

    // Kiểm tra từng action trong feature
    return feature.actions.some((action) => {
      const permissionCode = `${featureCode}_${action}`;
      const changedPermission = changes[roleId]?.find(
        (p) => p.code === permissionCode
      );

      // Nếu có thay đổi, kiểm tra giá trị checked
      if (changedPermission !== undefined) {
        return changedPermission.checked;
      }

      // Nếu không có thay đổi, kiểm tra trong permissions hiện tại
      return role.permissions.includes(permissionCode);
    });
  };

  // Mở tất cả hoặc đóng tất cả tính năng
  const expandAllFeatures = () => {
    const allExpanded = {};
    features.forEach((feature) => {
      allExpanded[feature.name] = true;
    });
    setExpandedFeatures(allExpanded);
  };

  const collapseAllFeatures = () => {
    const allCollapsed = {};
    features.forEach((feature) => {
      allCollapsed[feature.name] = false;
    });
    setExpandedFeatures(allCollapsed);
  };

  const columns = [
    {
      title: "Tính năng",
      dataIndex: "feature",
      key: "feature",
      className: "feature-column-header",
      width: "20%",
      render: (text, record) => {
        if (record.isHeader) {
          const isExpanded = expandedFeatures[record.feature] !== false;
          return (
            <div
              className="feature-header"
              style={{ display: "flex", alignItems: "center", height: "auto" }}
              onClick={() => toggleFeatureExpand(record.feature)}
            >
              <span
                className="feature-toggle-icon"
                style={{ marginRight: "8px", cursor: "pointer" }}
              >
                {isExpanded ? <DownOutlined /> : <RightOutlined />}
              </span>
              <b>{text}</b>
            </div>
          );
        }
        return (
          <span className="feature-action" style={{ paddingLeft: "20px" }}>
            {record.display}
          </span>
        );
      },
    },
    ...roles.map((role) => ({
      title: role.title,
      dataIndex: role.title,
      key: role.title,
      align: "center",
      className: "role-column-header",
      width: `${80 / roles.length}%`,
      render: (text, record) => {
        if (record.isHeader) {
          // Hiển thị checkbox cho header tính năng với class mới
          return (
            <Checkbox
              checked={isFeatureFullyChecked(role._id, record.featureCode)}
              indeterminate={isFeaturePartiallyChecked(
                role._id,
                record.featureCode
              )}
              onChange={(e) =>
                handleFeatureAllPermissions(
                  role._id,
                  record.featureCode,
                  e.target.checked
                )
              }
              className="feature-header-checkbox"
            />
          );
        }

        if (!record.isHeader) {
          const permissionCode = `${record.featureCode}_${record.action}`;
          const hasPermission = role.permissions.includes(permissionCode);
          const changedPermission = changes[role._id]?.find(
            (p) => p.code === permissionCode
          );
          const isChecked =
            changedPermission !== undefined
              ? changedPermission.checked
              : hasPermission;

          return (
            <Checkbox
              checked={isChecked}
              onChange={(e) =>
                handleCheckboxChange(role._id, permissionCode, e.target.checked)
              }
            />
          );
        }
        return null;
      },
    })),
  ];

  const handleCheckboxChange = (roleId, permissionCode, checked) => {
    setChanges((prevChanges) => {
      const roleChanges = prevChanges[roleId] || [];
      const existingChangeIndex = roleChanges.findIndex(
        (p) => p.code === permissionCode
      );

      if (existingChangeIndex >= 0) {
        roleChanges[existingChangeIndex].checked = checked;
      } else {
        roleChanges.push({ code: permissionCode, checked });
      }

      return { ...prevChanges, [roleId]: roleChanges };
    });
  };

  const handleUpdatePermissions = async () => {
    setLoading(true);

    try {
      const updatedPermissionsData = [];

      for (const roleId in changes) {
        const role = roles.find((r) => r._id === roleId);
        if (!role) continue;

        let updatedPermissions = [...role.permissions];
        changes[roleId].forEach((change) => {
          if (change.checked) {
            if (!updatedPermissions.some((p) => p === change.code)) {
              updatedPermissions.push(change.code);
            }
          } else {
            updatedPermissions = updatedPermissions.filter(
              (p) => p !== change.code
            );
          }
        });

        updatedPermissionsData.push({
          id: roleId,
          permissions: updatedPermissions,
        });
      }

      console.log("updatedPermissionsData", updatedPermissionsData);

      const response = await axios.patch(
        `${process.env.REACT_APP_API_URL}admin/roles/permissions`,
        {
          permissions: updatedPermissionsData,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        await fetchPermissions();
        await form.setFieldsValue({
          title: "",
          description: "",
        });
        setShowNotification({
          status: "success",
          message: "Thành công",
          description: "Cập nhật thông tin hệ thống thành công",
        });
        setTimeout(() => {
          setShowNotification(null);
        }, 3000);
      } else {
        setShowNotification({
          status: "error",
          message: "Thất bại",
          description: "Cập nhật thông tin hệ thống thất bại",
        });

        setTimeout(() => {
          setShowNotification(null);
        }, 3000);
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin hệ thống:", error);
      setShowNotification({
        status: "error",
        message: "Thất bại",
        description: "Lỗi khi cập nhật thông tin hệ thống: " + error.message,
      });

      setTimeout(() => {
        setShowNotification(null);
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const showModal = (content) => {
    setModalContent(content);
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const dataToSend = {
        title: values.title,
        description: values.description,
      };

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}admin/roles/create`,
        dataToSend,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      form.setFieldValue();

      if (response.status === 200) {
        await fetchPermissions();
        await form.setFieldsValue({
          title: "",
          description: "",
        });
        setShowNotification({
          status: "success",
          message: "Thành công",
          description: "Cập nhật thông tin hệ thống thành công",
        });
        setTimeout(() => {
          setShowNotification(null);
        }, 3000);
      } else {
        setShowNotification({
          status: "error",
          message: "Thất bại",
          description: "Cập nhật thông tin hệ thống thất bại",
        });

        setTimeout(() => {
          setShowNotification(null);
        }, 3000);
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin hệ thống:", error);
      setShowNotification({
        status: "error",
        message: "Thất bại",
        description: "Lỗi khi cập nhật thông tin hệ thống: " + error.message,
      });

      setTimeout(() => {
        setShowNotification(null);
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRole = async (roleId) => {
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}admin/roles/delete/${roleId}`
      );

      if (response.status === 200) {
        await fetchPermissions();
        await form.setFieldsValue({
          title: "",
          description: "",
        });
        setShowNotification({
          status: "success",
          message: "Thành công",
          description: "Cập nhật thông tin hệ thống thành công",
        });
        setTimeout(() => {
          setShowNotification(null);
        }, 3000);
      } else {
        setShowNotification({
          status: "error",
          message: "Thất bại",
          description: "Cập nhật thông tin hệ thống thất bại",
        });

        setTimeout(() => {
          setShowNotification(null);
        }, 3000);
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin hệ thống:", error);
      setShowNotification({
        status: "error",
        message: "Thất bại",
        description: "Lỗi khi cập nhật thông tin hệ thống: " + error.message,
      });

      setTimeout(() => {
        setShowNotification(null);
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const data = [];
  features.forEach((feature) => {
    data.push({
      key: feature.name,
      feature: feature.name,
      featureCode: feature.code, // Thêm featureCode cho header
      isHeader: true,
    });

    // Chỉ hiển thị các hành động nếu tính năng đang được mở rộng
    const isExpanded = expandedFeatures[feature.name] !== false;
    if (isExpanded) {
      feature.actions.forEach((action) => {
        data.push({
          key: `${feature.name}-${action}`,
          featureCode: feature.code,
          feature: feature.name,
          action: action,
          isHeader: false,
          display:
            action === "view"
              ? "Xem"
              : action === "create"
              ? "Thêm mới"
              : action === "edit"
              ? "Chỉnh sửa"
              : "Xóa",
        });
      });
    }
  });

  const showDeleteConfirm = (role) => {
    setSelectedRole(role); // Lưu lại role đang muốn xóa
    setRecord(role); //Lưu trữ luôn object
    setDeleteModalVisible(true); // Mở modal xác nhận xóa
  };

  const hideDeleteConfirm = () => {
    setDeleteModalVisible(false); // Đóng modal xác nhận xóa
    setSelectedRole(null);
    setRecord(null);
  };

  const handleConfirmDelete = () => {
    if (selectedRole) {
      handleDeleteRole(selectedRole._id); // Gọi hàm xóa với roleId
      hideDeleteConfirm(); // Đóng modal sau khi xóa
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
            <span className="header-title">Phân quyền người dùng</span>
          </div>
        </div>
        <Card className="permission-page-card" style={{ border: "none" }}>
          <Table
            columns={columns}
            dataSource={data}
            bordered
            pagination={false}
            className="permission-table"
            loading={loading}
          />
          <div style={{ marginTop: "20px" , display: "flex", justifyContent: "space-between"}}>
            <span>
            <Button
              type="primary"
              onClick={handleUpdatePermissions}
              loading={loading}
              htmlType="submit"
              style={{
                marginLeft: "30px",
                height: "40px",
                background:
                  "linear-gradient(135deg, #07BF73 0%,#17CF73 50%, #17CF83 100%)",
                border: "none",
              }}
            >
              <span style={{ color: "white", fontSize: "14px" }}>Cập nhật</span>
            </Button>
            <Button
              type="primary"
              onClick={() => showModal("addDelete")}
              style={{
                width: "80px",
                height: "40px",
                marginLeft: "20px",
                background: "linear-gradient(135deg, #1161D7 0%, #1371E7 100%)",
                border: "none",
              }}
            >
              <span style={{ color: "white", fontSize: "14px" }}>Quản lý</span>
            </Button>
            </span>
            <span style={{ marginBottom: "10px", textAlign: "right" }}>
              <Button
                type="link"
                onClick={expandAllFeatures}
                style={{ marginRight: "10px", fontSize: "20px" }}
              >
                Mở tất cả
              </Button>
              <Button
                type="link"
                onClick={collapseAllFeatures}
                style={{ marginRight: "10px", fontSize: "20px" }}
              >
                Thu gọn tất cả
              </Button>
            </span>
          </div>

          <Modal
            title={
              <span style={{ fontWeight: "bolder", fontSize: "16px" }}>
                Quản lý phân quyền
              </span>
            }
            open={isModalVisible}
            onOk={handleOk}
            onCancel={handleCancel}
            footer={null}
            width={600}
          >
            {modalContent === "addDelete" && (
              <div style={{ display: "flex", gap: "20px" }}>
                <div style={{ flex: 1 }}>
                  <Divider orientation="center" style={{ fontWeight: "bold" }}>
                    <span style={{ fontSize: "14px", fontWeight: 600 }}>
                      Thêm
                    </span>
                  </Divider>
                  <Form form={form} onFinish={onFinish} layout="vertical">
                    <Form.Item
                      style={{ marginBottom: "-2px" }}
                      label={
                        <span
                          style={{
                            fontWeight: "500",
                            fontSize: "12px",
                          }}
                        >
                          Tên nhóm quyền
                        </span>
                      }
                      name="title"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập tên nhóm quyền!",
                        },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      label={
                        <span
                          style={{
                            fontWeight: "500",
                            fontSize: "12px",
                            marginTop: "14px",
                          }}
                        >
                          Mô tả
                        </span>
                      }
                      name="description"
                    >
                      <Input.TextArea />
                    </Form.Item>
                    <Form.Item
                      style={{
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      <Button type="primary" htmlType="submit">
                        Thêm
                      </Button>
                    </Form.Item>
                  </Form>
                </div>
                <Divider type="vertical" style={{ height: "auto" }} />
                <div style={{ flex: 1.2 }}>
                  <Divider orientation="center" style={{ fontWeight: "bold" }}>
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                      }}
                    >
                      Xóa
                    </span>
                  </Divider>
                  <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                    <ul style={{ listStyleType: "none", padding: 0 }}>
                      {roles.map((role) => (
                        <li
                          className="liLabelDelete"
                          key={role._id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginTop: "14px",
                            justifyContent: "space-between",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              marginLeft: "12px",
                            }}
                          >
                            <span
                              className="spanTitleDelete"
                              style={{ fontWeight: "600", marginBottom: "4px" }}
                            >
                              {role.title}
                            </span>
                            <span
                              style={{ fontWeight: 100 }}
                              className="spanDescriptionDelete"
                            >
                              {role.description}
                            </span>
                          </div>
                          <Button
                            type="primary"
                            danger
                            style={{
                              marginRight: "14px",
                              width: "28px",
                              height: "18px",
                            }}
                            size="small"
                            onClick={() => showDeleteConfirm(role)}
                          >
                            X
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </Modal>
          <Modal
            title="Xác nhận xóa nhóm quyền"
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
                  Bạn có chắc chắn muốn xóa nhóm quyền "{selectedRole?.title}"?
                </p>
                <Row gutter={[16, 16]} justify="center">
                  <Col span={24}>
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
                          fontWeight: "bold",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Mô Tả :
                      </span>
                      <span
                        style={{
                          width: "84%",
                          wordBreak: "break-word",
                        }}
                      >
                        {record?.description || "Chưa có"}
                      </span>
                    </div>
                  </Col>
                </Row>
              </div>
            </div>
          </Modal>
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

export default PermissionPage;
