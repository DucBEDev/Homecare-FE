import React, { useState } from "react";
import { Modal, Button, Row, Col } from "antd";
import axios from "axios";
import "../../../StylePage/stylePopupModalDelete.css"
import NotificationComponent from "../../../../../components/NotificationComponent/NotificationComponent";

const PopupModalDelete = ({
  isVisible,
  onClose,
  onDelete,
  record,
  orderData,
}) => {
  const [showNotification, setShowNotification] = useState(false);

  const handleDelete = async () => {
    try {
      let response = "";
      // Gọi API
      if (record.isLongTerm) {
        // Chuẩn bị dữ liệu gửi đi
        const payload = {
          requestId: record.mainOrderId,
          scheduleIds: record.scheduleIds,
        };

        console.log("payload delete:", payload);

        response = await axios.delete(
          `${process.env.REACT_APP_API_URL}admin/requests/delete/${record.mainOrderId}`,
          payload
        );
      } else {
        // Chuẩn bị dữ liệu gửi đi
        const payload = {
          requestDetailId: record.scheduleId,
        };

        console.log("payload delete:", payload);

        response = await axios.patch(
          `${process.env.REACT_APP_API_URL}admin/requests/detail/cancel/${record.scheduleId}`,
          payload
        );
      }

      // Xử lý kết quả thành công
      if (response.status === 200) {
        setShowNotification({
          status: "success",
          message: "Thành công",
          description: "Hủy thành công!",
        });

        if (onDelete) {
          onDelete();
        }
        // Đóng modal sau 1.5s
        setTimeout(() => {
          setShowNotification(null);
          onClose();
        }, 0);
      }
    } catch (error) {
      // Xử lý lỗi
      console.error("Error sending data to backend:", error);
      setShowNotification({
        status: "error",
        message: "Thất bại",
        description: "Không thể hủy. Vui lòng thử lại.",
      });
      setTimeout(() => {
        setShowNotification(null);
        onClose();
      }, 0);
    }
  };

  return (
    <Modal
      title="Xác nhận hủy lịch làm việc"
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
            Bạn có chắc chắn muốn hủy lịch làm việc này?
          </p>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <div className="info-item">
                <span>Ngày Làm:</span>
                <span>{record?.ngayLam}</span>
              </div>
            </Col>
            <Col span={12}>
              <div className="info-item">
                <span>Giờ Bắt Đầu:</span>
                <span>{record?.gioBatDau}</span>
              </div>
            </Col>
            <Col span={12}>
              <div className="info-item">
                <span>Giờ Kết Thúc:</span>
                <span>{record?.gioKetThuc}</span>
              </div>
            </Col>
            <Col span={12}>
              <div className="info-item">
                <span>Người Giúp Việc:</span>
                <span>{record?.nguoiGiupViec || "Chưa có"}</span>
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
