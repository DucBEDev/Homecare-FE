import React from "react";
import { Modal, Button, Row, Col, message } from "antd";
import "../../../StylePage/stylePopupModalDetail.css";
import axios from "axios";

const PopupModalDelete = ({
  isVisible,
  onClose,
  onDelete,
  record,
  orderData,
}) => {
  const handleDelete = async () => {
    try {
      // Hiển thị loading
      message.loading({ content: "Đang xử lý...", key: "deleteHelper" });

      // Chuẩn bị dữ liệu gửi đi
      const payload = {
        scheduleId: record.scheduleId,
        mainOrderId: record.mainOrderId,
      };

      console.log("payload delete:", payload);
      
      // Gọi API
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}admin/requests/deleteSchedule`,
        {
          data: payload,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Xử lý kết quả thành công
      if (response.status === 200) {
        message.success({
          content: "Xóa lịch làm việc thành công!",
          key: "deleteHelper",
          duration: 1000,
        });

        // Gọi callback để cập nhật UI
        onDelete(response.data);

        // Đóng modal
        onClose();
      }
    } catch (error) {
      // Xử lý lỗi
      console.error("Error deleting schedule:", error);
      message.error({
        content:
          error.response?.data?.message || "Có lỗi xảy ra khi xóa lịch làm việc!",
        key: "deleteHelper",
        duration: 2,
      });
    }
  };

  return (
    <Modal
      title="Xác nhận xóa lịch làm việc"
      visible={isVisible}
      onCancel={onClose}
      footer={[
        <Button
          key="delete"
          danger
          type="primary"
          onClick={handleDelete}
        >
          Xóa
        </Button>,
        <Button key="cancel" onClick={onClose}>
          Hủy
        </Button>,
      ]}
      width={600}
    >
      <div className="popup-content">
        <div className="info-section">
          <p style={{ marginBottom: 20, fontWeight: 'bold' }}>
            Bạn có chắc chắn muốn xóa lịch làm việc này?
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
    </Modal>
  );
};

export default PopupModalDelete;