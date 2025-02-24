import React, { useState } from "react";
import { Modal, Button, Row, Col } from "antd";
import axios from "axios";
import NotificationComponent from "../../../../../../components/NotificationComponent/NotificationComponent";

const PopupModalDelete = ({
  isVisible,
  onClose,
  onDelete,
  record,
  setLoading,
  setShowNotification,
  staffToDelete,
}) => {
  const [localShowNotification, setLocalShowNotification] = useState(null);

  const handleDelete = async () => {
    setLoading(true);  // Bắt đầu loading trước khi gọi API
    try {
      let response;

      // Gọi API
      response = await axios.delete(
        `${process.env.REACT_APP_API_URL}admin/staffs/delete/${staffToDelete}`
      );

      // Xử lý kết quả thành công
      if (response.status === 200) {
        setLocalShowNotification({
          status: "success",
          message: "Thành công",
          description: "Xóa nhân viên thành công!",
        });

        if (onDelete) {
          onDelete({key: staffToDelete});
        }

        // Đóng modal sau 1.5s
        setTimeout(() => {
          setLocalShowNotification(null);
          onClose();
        }, 1500);
      } else {
        // Xử lý kết quả thất bại
        setLocalShowNotification({
          status: "error",
          message: "Thất bại",
          description: `Lỗi khi xóa nhân viên (HTTP ${response.status})`,
        });
        setTimeout(() => {
          setLocalShowNotification(null);
          onClose();
        }, 1500);
      }
    } catch (error) {
      // Xử lý lỗi
      console.error("Error deleting staff:", error);
      setLocalShowNotification({
        status: "error",
        message: "Thất bại",
        description: `Lỗi khi xóa nhân viên: ${error.message}`,
      });
      setTimeout(() => {
        setLocalShowNotification(null);
        onClose();
      }, 1500);
    } finally {
      setLoading(false); // Kết thúc loading sau khi gọi API xong
    }
  };

  return (
    <Modal
      title="Xác nhận xóa nhân viên"
      visible={isVisible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Hủy
        </Button>,
        <Button
          key="delete"
          danger
          type="primary"
          onClick={handleDelete}
          className="delete-button"
        >
          Đồng ý
        </Button>,
      ]}
      width={600}
    >
      <div className="popup-content">
        <div className="info-section">
          <p style={{ marginBottom: 20, fontWeight: "bold" }}>
            Bạn có chắc chắn muốn xóa nhân viên này?
          </p>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <div className="info-item">
                <span>Số điện thoại:</span>
                <span>{record?.phoneNumber}</span>
              </div>
            </Col>
            <Col span={12}>
              <div className="info-item">
                <span>CMND:</span>
                <span>{record?.idCard}</span>
              </div>
            </Col>
            <Col span={12}>
              <div className="info-item">
                <span>Họ tên:</span>
                <span>{record?.fullName}</span>
              </div>
            </Col>
            <Col span={12}>
              <div className="info-item">
                <span>Ngày sinh:</span>
                <span>{record?.birthDate}</span>
              </div>
            </Col>
            <Col span={24}>
              <div className="info-item">
                <span>Địa chỉ:</span>
                <span>{record?.address}</span>
              </div>
            </Col>
          </Row>
        </div>
      </div>
      {localShowNotification && (
        <NotificationComponent
          status={localShowNotification.status}
          message={localShowNotification.message}
          description={localShowNotification.description}
        />
      )}
    </Modal>
  );
};

export default PopupModalDelete;