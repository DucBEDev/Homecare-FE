import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Checkbox,
  Button,
  message,
  Modal,
  Input,
  Form,
  Divider,
} from "antd";
import axios from "axios";
import "./PermissionPage.css";

const PermissionPage = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [changes, setChanges] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState(null);

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

  const handleUpdatePermissions = () => {
    setLoading(true);
    const promises = [];

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

      const promise = axios
        .patch(`${process.env.REACT_APP_API_URL}admin/roles/${roleId}`, {
          permissions: updatedPermissions,
        })
        .then(() => {
          console.log(`Cập nhật quyền cho role ${roleId} thành công`);
        })
        .catch((error) => {
          console.error(`Lỗi khi cập nhật quyền cho role ${roleId}:`, error);
          message.error(`Lỗi khi cập nhật quyền cho role ${role.title}`);
        });

      promises.push(promise);
    }

    Promise.all(promises)
      .then(() => {
        message.success("Cập nhật quyền thành công");
        fetchPermissions();
      })
      .catch(() => {
        message.error("Đã có lỗi xảy ra khi cập nhật quyền");
      })
      .finally(() => {
        setLoading(false);
      });
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

  const handleAddRole = async (values) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}admin/roles/create`,
        {
          title: values.title,
          description: values.description,
          permissions: [],
        }
      );

      if (response.data.status === "success") {
        message.success("Thêm nhóm quyền thành công");
        fetchPermissions();
        setIsModalVisible(false);
      } else {
        message.error(response.data.message || "Lỗi khi thêm nhóm quyền");
      }
    } catch (error) {
      console.error("Lỗi khi thêm nhóm quyền:", error);
      message.error("Lỗi khi thêm nhóm quyền");
    }
  };

  const handleDeleteRole = async (roleId) => {
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}admin/roles/${roleId}`
      );

      if (response.data.status === "success") {
        message.success("Xóa nhóm quyền thành công");
        fetchPermissions();
        setIsModalVisible(false);
      } else {
        message.error(response.data.message || "Lỗi khi xóa nhóm quyền");
      }
    } catch (error) {
      console.error("Lỗi khi xóa nhóm quyền:", error);
      message.error("Lỗi khi xóa nhóm quyền");
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
          title={<span style={{ fontWeight: "bolder" }}>QLNQ</span>}
          open={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
          footer={null}
          width={600}
        >
          {modalContent === "addDelete" && (
            <div style={{ display: "flex", gap: "20px" }}>
              <div style={{ flex: 1 }}>
                <Divider orientation="left" style={{ fontWeight: "bold" }}>
                  Thêm
                </Divider>
                <Form onFinish={handleAddRole} layout="vertical">
                  <Form.Item
                    label={
                      <span style={{ fontWeight: "500" }}>Tên nhóm quyền</span>
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
                    label={<span style={{ fontWeight: "500" }}>Mô tả</span>}
                    name="description"
                  >
                    <Input.TextArea />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit">
                      Thêm
                    </Button>
                  </Form.Item>
                </Form>
              </div>
              <div style={{ flex: 1 }}>
                <Divider orientation="left" style={{ fontWeight: "bold" }}>
                  Xóa
                </Divider>
                <ul style={{ listStyleType: "none", padding: 0 }}>
                  {roles.map((role) => (
                    <li
                      key={role._id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "10px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          marginRight: "10px",
                        }}
                      >
                        <span style={{ fontWeight: "500" }}>{role.title}</span>
                        <span>{role.description}</span>
                      </div>
                      <Button
                        type="primary"
                        danger
                        onClick={() =>
                          Modal.confirm({
                            title: "Xác nhận xóa",
                            content: `Bạn có chắc chắn muốn xóa nhóm quyền ${role.title}?`,
                            okText: "Xóa",
                            okType: "danger",
                            cancelText: "Hủy",
                            onOk: () => handleDeleteRole(role._id),
                          })
                        }
                      >
                        X
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </Modal>
      </Card>
    </div>
  );
};

export default PermissionPage;
