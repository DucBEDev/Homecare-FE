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
} from "antd";
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
  const confirmRef = useRef(null);
  const [form] = Form.useForm();

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
      name: "Quản lý người giúp việc",
      code: "helpers",
      actions: ["view", "create", "edit", "delete"],
    },
    {
      name: "Quản lý nhân viên",
      code: "staffs",
      actions: ["view", "create", "edit", "delete"],
    },
  ];

  const columns = [
    {
      title: "Tính năng",
      dataIndex: "feature",
      key: "feature",
      className: "feature-column-header",
      render: (text, record) => {
        if (record.isHeader) {
          return <b>{text}</b>;
        }
        return record.display;
      },
    },
    ...roles.map((role) => ({
      title: role.title,
      dataIndex: role.title,
      key: role.title,
      align: "center",
      className: "role-column-header",
      render: (text, record) => {
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
      const updatedPermissionsData = []; // Mảng chứa thông tin cập nhật của các role

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

        // Thêm thông tin role đã cập nhật vào mảng updatedPermissionsData
        updatedPermissionsData.push({
          id: roleId, // id của role
          permissions: updatedPermissions, // mảng permissions đã cập nhật
        });
      }
      // const payload = permissions: updatedPermissionsData;

      // console.log("aass", payload);

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

      console.log("c", dataToSend);

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

  const data = [];
  features.forEach((feature) => {
    data.push({
      key: feature.name,
      feature: feature.name,
      isHeader: true,
    });
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
  });

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
          <div style={{ marginTop: "20px" }}>
            <Button
              type="primary"
              onClick={handleUpdatePermissions}
              loading={loading}
              htmlType="submit"
              style={{
                marginLeft: "30px",
                height: "40px",
                backgroundColor: "#3CBE5D",
                border: "none",
              }}
            >
              <span style={{ color: "white", fontSize: "14px" }}>Cập nhật</span>
            </Button>
            <Button
              type="primary"
              onClick={() => showModal("addDelete")}
              style={{
                position: "fixed",
                right: "50px",
                width: "80px",
                height: "40px",
                backgroundColor: "#1FA1A7",
                border: "none",
              }}
            >
              <span style={{ color: "white", fontSize: "14px" }}>Quản lý</span>
            </Button>
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
                <div style={{ flex: 1 }}>
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
                              marginLeft: "18px",
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
                              marginRight: "16px",
                              width: "28px",
                              height: "18px",
                            }}
                            size="small"
                            onClick={() => {
                              confirmRef.current = Modal.confirm({
                                // Lưu instance vào confirmRef.current
                                title: "Xác nhận xóa",
                                content: `Bạn có chắc chắn muốn xóa nhóm quyền ${role.title}?`,
                                okText: "Xóa",
                                okType: "danger",
                                cancelText: "Hủy",
                                onOk: () => handleDeleteRole(role._id),
                                footer: (
                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "flex-end",
                                      gap: "8px",
                                    }}
                                  >
                                    <Button
                                      onClick={() => {
                                        confirmRef.current.destroy(); // Đóng Modal confirm từ footer
                                      }}
                                    >
                                      Hủy
                                    </Button>
                                    <Button
                                      type="primary"
                                      danger
                                      onClick={() => {
                                        handleDeleteRole(role._id);
                                        confirmRef.current.destroy(); // Đóng Modal confirm từ footer
                                      }}
                                    >
                                      Xóa
                                    </Button>
                                  </div>
                                ),
                              });
                            }}
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
