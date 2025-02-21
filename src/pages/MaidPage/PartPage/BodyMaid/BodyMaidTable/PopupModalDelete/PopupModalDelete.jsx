import React, { useState } from "react";
import { Modal, Button, Row, Col } from "antd";
import axios from "axios";
import NotificationComponent from "../../../../../../components/NotificationComponent/NotificationComponent";

const PopupModalDelete = ({
  isVisible,
  onClose,
  onDelete,
  record,
}) => {
  const [showNotification, setShowNotification] = useState(false);

  const handleDelete = async () => {
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}admin/helpers/delete/${record.key}`
      );

      if (response.status === 200) {
        setShowNotification({
          status: "success",
          message: "Thành công",
          description: "Xóa người giúp việc thành công!",
        });

        if (onDelete) {
          onDelete(record);
        }
        
        setTimeout(() => {
          setShowNotification(null);
          onClose();
        }, 0);
      }
    } catch (error) {
      console.error("Error deleting helper:", error);
      setShowNotification({
        status: "error",
        message: "Thất bại",
        description: "Không thể xóa người giúp việc. Vui lòng thử lại.",
      });
      setTimeout(() => {
        setShowNotification(null);
        onClose();
      }, 0);
    }
  };

  return (
    <Modal
      title="Xác nhận xóa người giúp việc"
      visible={isVisible}
      onCancel={onClose}
      footer={[
        <Button key="delete" danger type="primary" onClick={handleDelete} className="delete-button">
          Đồng ý
        </Button>,
        <Button key="cancel" onClick={onClose}>
          Hủy
        </Button>,
      ]}
      width={600}
    >
      <div className="popup-content">
        <div className="info-section">
          <p style={{ marginBottom: 20, fontWeight: "bold" }}>
            Bạn có chắc chắn muốn xóa người giúp việc này?
          </p>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <div className="info-item">
                <span>Họ tên:</span>
                <span>{record?.fullName}</span>
              </div>
            </Col>
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
                <span>Trạng thái:</span>
                <span>{record?.status}</span>
              </div>
            </Col>
          </Row>
        </div>
      </div>
      {showNotification && (
        <NotificationComponent
          status={showNotification.status}
          message={showNotification.message}
          description={showNotification.description}
        />
      )}
    </Modal>
  );
};

export default PopupModalDelete;