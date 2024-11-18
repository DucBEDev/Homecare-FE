import React, { useEffect, useState } from "react";
import { Modal, Button, Row, Col, Radio, Rate } from "antd";
import "../../../StylePage/stylePopupModalDetail.css"; // Sử dụng cùng file CSS với Detail
import axios from "axios";
import NotificationComponent from "../../../../../components/NotificationComponent/NotificationComponent";
import "../../../StylePage/stylePopupModalFinish.css";

const PopupModalFinish = ({
  isVisible,
  onClose,
  onFinish,
  record,
  orderData,
}) => {
  console.log("orrderdatafinisn", orderData);
  console.log("recrdatafinisn", record);
  const [costHelper, setCostHelper] = useState(0);
  console.log("costhekper", costHelper);

  useEffect(() => {
    const fetchTotalBill = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}admin/requests/updateRequestDetailDone/${record.scheduleId}`
        );
        setCostHelper(response.data.helper_cost);
        console.log("Cost for helper response:", response.data);
      } catch (error) {
        console.error("Error fetching cost for helper:", error);
      }
    };

    if (record?.scheduleId) {
      fetchTotalBill();
    }
  }, [record?.scheduleId]);

  const [showNotification, setShowNotification] = useState(null);
  const [formData, setFormData] = useState({
    rating: 3,
    contactCustomer: true,
    lostAsset: false,
    damagedAsset: false,
  });

  const handleFinish = async () => {
    try {
      const payload = {
        review: formData.rating,
        loseThings: formData.lostAsset,
        breakThings: formData.damagedAsset,
      };

      const response = await axios.patch(
        `${process.env.REACT_APP_API_URL}admin/requests/updateRequestDetailDone/${record.scheduleId}`,
        payload
      );

      if (response.status === 200) {
        setShowNotification({
          status: "success",
          message: "Thành công",
          description: "Hoàn thành công việc thành công!",
        });

        if (onFinish) {
          onFinish();
        }

        setTimeout(() => {
          onClose();
          setShowNotification(null);
        }, 2000);
      }
    } catch (error) {
      console.error("Error:", error);
      setShowNotification({
        status: "error",
        message: "Thất bại",
        description: "Không thể hoàn thành. Vui lòng thử lại.",
      });
    }
  };

  return (
    <>
      <Modal
        title="Đánh giá và hoàn thành"
        visible={isVisible}
        onCancel={onClose}
        footer={[
          <Button key="finish" type="primary" onClick={handleFinish}>
            Hoàn thành
          </Button>,
          <Button key="cancel" onClick={onClose}>
            Đóng
          </Button>,
        ]}
        width={700}
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

          <div className="evaluation-section">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div className="info-item">
                  <span>Người giúp việc:</span>
                  <span>{record?.nguoiGiupViec}</span>
                </div>
              </Col>
              <Col span={12}>
                <div className="info-item">
                  <span>Số ĐT:</span>
                  <span>{record?.phoneHelper}</span>
                </div>
              </Col>

              <Col span={16}>
                <div className="question-section">
                  <span>Có liên hệ được với khách hàng không?</span>
                  <Radio.Group
                    value={formData.contactCustomer}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contactCustomer: e.target.value,
                      })
                    }
                  >
                    <Radio value={true}>Có</Radio>
                    <Radio value={false}>Không</Radio>
                  </Radio.Group>
                </div>
              </Col>
              <Col span={8}>
                <div className="info-item">
                  <span>Lương NGV:</span>
                  <span>{costHelper?.toLocaleString("vi-VN")} VNĐ</span>
                </div>
              </Col>

              <Col span={12}>
                <div className="rating-section">
                  <span>Mức Đánh Giá:</span>
                  {(() => {
                    if (formData.rating === 1) {
                      return <span>Rất kém</span>;
                    } else if (formData.rating === 2) {
                      return <span>Kém</span>;
                    } else if (formData.rating === 3) {
                      return <span>Trung bình</span>;
                    } else if (formData.rating === 4) {
                      return <span>Tốt</span>;
                    } else {
                      return <span>Rất tốt</span>;
                    }
                  })()}
                </div>
              </Col>
              <Col span={12}>
                <div className="rating-section">
                  <Rate
                    value={formData.rating}
                    onChange={(value) =>
                      setFormData({ ...formData, rating: value })
                    }
                  />
                </div>
              </Col>

              <Col span={24}>
                <div className="question-section">
                  <span>Quý khách có bị thất lạc tài sản không?</span>
                  <Radio.Group
                    value={formData.lostAsset}
                    onChange={(e) =>
                      setFormData({ ...formData, lostAsset: e.target.value })
                    }
                  >
                    <Radio value={false}>Không</Radio>
                    <Radio value={true}>Có</Radio>
                  </Radio.Group>
                </div>
              </Col>

              <Col span={24}>
                <div className="question-section">
                  <span>Quý khách có tài sản bị hư hỏng không?</span>
                  <Radio.Group
                    value={formData.damagedAsset}
                    onChange={(e) =>
                      setFormData({ ...formData, damagedAsset: e.target.value })
                    }
                  >
                    <Radio value={false}>Không</Radio>
                    <Radio value={true}>Có</Radio>
                  </Radio.Group>
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </Modal>

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

export default PopupModalFinish;
