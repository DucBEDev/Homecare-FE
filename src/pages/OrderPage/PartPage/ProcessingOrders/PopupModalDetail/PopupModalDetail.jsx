import React, { useEffect, useState } from "react";
import { Modal, Select, Button, Row, Col, message } from "antd";
import "../../../StylePage/stylePopupModalDetail.css";
import NotificationComponent from "../../../../../components/NotificationComponent/NotificationComponent";
import axios from "axios";

const { Option } = Select;

const PopupModalDetail = ({
  isVisible,
  onClose,
  onAssign,
  record,
  orderData,
  allHelpers,
}) => {
  console.log("ccdmm", record);
  const [selectedHelper, setSelectedHelper] = useState(
    record?.currentHelperId ? 
    allHelpers.find(h => h.id === record.currentHelperId)?.fullName || "Chưa có" 
    : "Chưa có"
  );
  const [selectedHelperInfo, setSelectedHelperInfo] = useState(null);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (record && isVisible) {
      // Tìm helper dựa trên currentHelperId
      const currentHelperInfo = allHelpers.find(
        (h) => h.id === record.currentHelperId
      );
      
      setSelectedHelper(currentHelperInfo?.fullName || "Chưa có");
      setSelectedHelperInfo(currentHelperInfo || null);
    } else {
      setSelectedHelper("Chưa có");
      setSelectedHelperInfo(null);
    }
  }, [record, isVisible, allHelpers]);

  useEffect(() => {
    if (selectedHelper) {
      // Tìm helper info từ allHelpers dựa vào helperName
      const helperInfo = allHelpers.find(
        (helper) => helper.fullName === selectedHelper
      );
      setSelectedHelperInfo(helperInfo);
      console.log("helperinfo ccc", helperInfo);
    } else {
      setSelectedHelperInfo(null);
    }
  }, [selectedHelper, allHelpers]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const handleHelperChange = (value) => {
    setSelectedHelper(value);
  };

  const handleAssign = async () => {
    try {
      // Hiển thị loading
      // message.loading({ content: "Đang xử lý...", key: "assignHelper" });

      // Chuẩn bị dữ liệu gửi đi
      const payload = {
        requestDetailId: record.scheduleId || record.mainOrderId,
        helper_id: selectedHelperInfo?.id, // ID của helper được chọn
        startTime: record.gioBatDau,
        endTime: record.gioKetThuc,
        helper_baseFactor: selectedHelperInfo.baseFactor,
        coefficient_service: record.coefficient_service,
        coefficient_other: record.coefficient_other,
      };

      console.log("payload", payload);
      // Gọi API
      let response = ""
     if(record.isLongTerm) {
      response = await axios.post(
        `${process.env.REACT_APP_API_URL}admin/requests/assignFullRequest/${record.scheduleId}`,
        
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
     } else {
      response = await axios.post(
        `${process.env.REACT_APP_API_URL}admin/requests/assignSubRequest/${record.scheduleId}`,
        
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
     }

      // Xử lý kết quả thành công
      if (response.status === 200) {
        setShowNotification({
          status: "success",
          message: "Thành công",
          description: "Giao việc thành công!",
        });
        setTimeout(() => {
          setShowNotification(null);
        }, 1500);

        // Gọi callback để cập nhật UI
        onAssign(response.data);
        // Đóng modal
        onClose();
      }
    } catch (error) {
      // Xử lý lỗi
      console.error("Error sending data to backend:", error);
        setShowNotification({
          status: "error",
          message: "Thất bại",
          description: "Không thể giao việc. Vui lòng thử lại.",
        });
        setTimeout(() => {
          setShowNotification(null);
        }, 1500);
    }
  };


  
  const isButtonDisabled = () => {
    // Nếu đã chọn helper mới (selectedHelper không null và khác "Chưa có")
    // thì enable button (return false)
    return !selectedHelper || selectedHelper === "Chưa có";
  };

  return (
    <Modal
      title="Giao việc"
      visible={isVisible}
      onCancel={onClose}
      footer={[
        <Button
          key="assign"
          onClick={handleAssign}
          disabled={isButtonDisabled()}
        >
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
            <Col span={10} offset={2}>
              <Select
                style={{ width: "100%" }}
                value={selectedHelper}
                onChange={handleHelperChange}
                placeholder="Chọn người giúp việc"
                showSearch
                optionFilterProp="children"
                defaultValue={record?.nguoiGiupViec}
              >
                {allHelpers?.map((helper, index) => (
                  <Option key={`helper_${index}`} value={helper.fullName}>
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
                <span>{selectedHelperInfo?.fullName || "N/A"}</span>
              </div>
            </Col>
            <Col span={12}>
              <div className="info-item">
                <span>Ngày sinh - Tuổi:</span>
                <span>
                  {formatDate(selectedHelperInfo?.dateOfBirth) || "N/A"}
                </span>
              </div>
            </Col>
            <Col span={12}>
              <div className="info-item">
                <span>Số ĐT:</span>
                <span>{selectedHelperInfo?.phone || "N/A"}</span>
              </div>
            </Col>
            <Col span={12}>
              <div className="info-item">
                <span>Địa Chỉ:</span>
                <span>{selectedHelperInfo?.address || "N/A"}</span>
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

export default PopupModalDetail;
