import React, { useEffect, useState } from "react";
import { Modal, Select, Button, Row, Col } from "antd";
import "../../../StylePage/stylePopupModalDetail.css";

const { Option } = Select;

const PopupModalDetail = ({
  isVisible,
  onClose,
  onAssign,
  record,
  orderData,
  allHelpers,
}) => {
  const [selectedHelper, setSelectedHelper] = useState(record?.helperId);
  const [selectedHelperInfo, setSelectedHelperInfo] = useState(null);

  

  useEffect(() => {
    setSelectedHelper(record?.helperId);
  }, [record]);

  useEffect(() => {
    const helperInfo = allHelpers.find(helper => helper.id === selectedHelper);
    setSelectedHelperInfo(helperInfo);
  }, [selectedHelper, allHelpers]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  const handleHelperChange = (value) => {
    setSelectedHelper(value);
  };

  const handleAssign = () => {
    onAssign({
      ...record,
      helperId: selectedHelper
    });
  };
  return (
    <Modal
      title="Giao việc"
      visible={isVisible}
      onCancel={onClose}
      footer={[
        <Button key="assign" onClick={handleAssign}>
          Giao việc
        </Button>,
        <Button key="cancel" onClick={onClose}>
          Đóng
        </Button>,
      ]}
      width={600}
    >
      <div className="popup-content">
        <div className="info-section">
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <div className="info-item">
                <span>Số ĐT Khách Hàng:</span>
                <span>{orderData?.soDTKhachHang}</span>
              </div>
            </Col>
            <Col span={12}>
              <div className="info-item">
                <span>Loại dịch vụ:</span>
                <span>{orderData?.loaiDichVu}</span>
              </div>
            </Col>
            <Col span={12}>
              <div className="info-item">
                <span>Ngày Làm:</span>
                <span>{record?.ngayLam}</span>
              </div>
            </Col>
            <Col span={12}>
              <div className="info-item">
                <span>Địa Chỉ Yêu Cầu:</span>
                <span>{orderData?.diaChiYeuCau}</span>
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
          </Row>
        </div>
        <div className="helper-section">
          <Row>
            <Col span={6}>
              <span>Người Giúp Việc:</span>
            </Col>
            <Col span={10} offset={2} >
              <Select
                style={{ width: "100%" }}
                value={selectedHelper}
                onChange={handleHelperChange}
                
              >
                {allHelpers.map((helper) => (
                  <Option key={helper.id} value={helper.id}>
                    {helper.fullName}
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <div className="info-item">
                <span>Họ Tên:</span>
                <span>{selectedHelperInfo?.fullName || 'N/A'}</span>
              </div>
            </Col>
            <Col span={12}>
            <div className="info-item">
                <span>Ngày sinh - Tuổi:</span>
                <span>{formatDate(selectedHelperInfo?.dateOfBirth) || 'N/A'}</span>
              </div>
            </Col>
            <Col span={12}>
              <div className="info-item">
                <span>Số ĐT:</span>
                <span>{selectedHelperInfo?.phone || 'N/A'}</span>
              </div>
            </Col>
            <Col span={12}>
              <div className="info-item">
                <span>Địa Chỉ:</span>
                <span>{selectedHelperInfo?.address || 'N/A'}</span>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </Modal>
  );
};

export default PopupModalDetail;
