import React, { useEffect, useState } from "react";
import { Modal, Button, Row, Col, Radio, Rate } from "antd";
import "../../../StylePage/stylePopupModalDetail.css"; // Sử dụng cùng file CSS với Detail
import axios from "axios";
import "../../../StylePage/stylePopupModalFinish.css";

const PopupModalDetail = ({
  isVisible,
  onClose,
  onFinish,
  record,
  orderData,
}) => {
  const [costHelper, setCostHelper] = useState(0);
  const [customerRateHistory, setCustomerRateHistory] = useState([]);
  console.log("re2", record)
  console.log("re455", customerRateHistory)


  useEffect(() => {
    const fetchHelperCost = async () => {
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

    const fetchCustomerRateHistory = async (requestDetailId) => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}admin/requests/detail/history/${record.scheduleId}`
        );
        setCustomerRateHistory(response.data.comment);
      } catch (error) {
        console.error("Error fetching customer history:", error);
        return null;
      }
    };

    if (record?.scheduleId) {
      fetchHelperCost();
      fetchCustomerRateHistory();
    }
  }, [record?.scheduleId]);

  const [formData, setFormData] = useState({
    rating: 3,
    contactCustomer: true,
    lostAsset: false,
    damagedAsset: false,
  });

  return (
    <>
      <Modal
        title="Đánh giá và hoàn thành"
        visible={isVisible}
        onCancel={onClose}
        footer={[
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

              <Col span={8}>
                <div className="info-item">
                  <span>Lương NGV:</span>
                  <span>{costHelper?.toLocaleString("vi-VN")} VNĐ</span>
                </div>
              </Col>
              <Col span={16}/>

              <Col span={12}>
                <div className="rating-section">
                  <span>Mức Đánh Giá:</span>
                  <span>{customerRateHistory.review}</span>
                </div>
              </Col>
              <Col span={12}>
                <div className="rating-section">
                  <Rate
                    value={customerRateHistory.review}
                    disabled
                  />
                </div>
              </Col>

              <Col span={24}>
                <div className="question-section">
                  <span>Quý khách có bị thất lạc tài sản không?</span>
                  <span style={{color: '#000', marginLeft: '10px'}}>{customerRateHistory.loseThings === true ? "Có" : "Không"}</span>
                </div>
              </Col>

              <Col span={24}>
                <div className="question-section">
                  <span>Quý khách có tài sản bị hư hỏng không?</span>
                  <span style={{color: '#000', marginLeft: '10px'}}>{customerRateHistory.breakThings === true ? "Có" : "Không"}</span>
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default PopupModalDetail;
