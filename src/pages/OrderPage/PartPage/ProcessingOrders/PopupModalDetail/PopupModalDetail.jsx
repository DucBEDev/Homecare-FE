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
    record?.currentHelperId
      ? allHelpers.find((h) => h.id === record.currentHelperId)?.fullName ||
          "Chưa có"
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

  // Hàm helper để chuyển đổi định dạng ngày
const convertDateFormat = (dateStr) => {
  // Tách lấy phần ngày tháng năm (bỏ qua phần thứ)
  const datePart = dateStr.split(', ')[1];
  const [day, month, year] = datePart.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

  // Thêm các hàm helper mới
  const isWeekend = (dateStr) => {
    const date = new Date(dateStr);
    const day = date.getDay();
    return day === 0 || day === 6; // 0 là Chủ nhật, 6 là thứ 7
  };

  const isHoliday = (dateStr) => {
    // Danh sách ngày lễ (có thể lấy từ API hoặc config)
    const holidays = [
      "2024-01-01", // Năm mới
      "2024-02-10", // Mùng 1 Tết
      "2024-02-11", // Mùng 2 Tết
      "2024-02-12", // Mùng 3 Tết
      "2024-04-30", // Giải phóng miền Nam
      "2024-05-01", // Quốc tế Lao động
      "2024-09-02", // Quốc khánh
      // Thêm các ngày lễ khác
    ];
    const formattedDate = convertDateFormat(dateStr);
  return holidays.includes(formattedDate);
  };

  const isOvertime = (startTime, endTime) => {
    // Giả sử giờ làm việc bình thường là 8:00 - 17:00
    const normalStartHour = 8;
    const normalEndHour = 17;

    const startHour = parseInt(startTime.split(":")[0]);
    const endHour = parseInt(endTime.split(":")[0]);

    return startHour < normalStartHour || endHour > normalEndHour;
  };

  const getCoefficients = (dateStr, startTime, endTime) => {
    // Hệ số cho ngày cuối tuần và ngày lễ
    const weekendCoefficient = record.coefficientOtherList.find(item => item.title === "Hệ số cuối tuần")?.value || 1;
    const holidayCoefficient = record.coefficientOtherList.find(item => item.title === "Hệ số ngày lễ")?.value || 1;
    const overtimeCoefficient = record.coefficientOtherList.find(item => item.title === "Hệ số ngoài giờ")?.value || 1;

    let coefficient_other = 1;
    let coefficient_ot = 1;

    // Kiểm tra và lấy hệ số cao nhất giữa cuối tuần và ngày lễ
    if (isWeekend(dateStr)) {
      coefficient_other = weekendCoefficient;
    }
    if (isHoliday(dateStr)) {
      coefficient_other = Math.max(coefficient_other, holidayCoefficient);
    }

    // Kiểm tra overtime
    if (isOvertime(startTime, endTime)) {
      coefficient_ot = overtimeCoefficient;
    }

    return { coefficient_other, coefficient_ot };
  };

  const handleAssign = async () => {
    try {
      // Chuẩn bị dữ liệu gửi đi
      const { coefficient_other, coefficient_ot } = getCoefficients(
        record.ngayLam,
        record.gioBatDau,
        record.gioKetThuc
      );

      const payload = {
        requestDetailId: record.scheduleId || record.mainOrderId,
        helper_id: selectedHelperInfo?.id, // ID của helper được chọn
        startTime: record.gioBatDau,
        endTime: record.gioKetThuc,
        helper_baseFactor: selectedHelperInfo.baseFactor,
        coefficient_other: coefficient_other,
        coefficient_ot: coefficient_ot,
      };

      console.log("payload", payload);
      // Gọi API
      let response = "";
      if (record.isLongTerm) {
        response = await axios.patch(
          `${process.env.REACT_APP_API_URL}admin/requests/detail/assignFullRequest`,

          payload,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      } else {
        response = await axios.patch(
          `${process.env.REACT_APP_API_URL}admin/requests/detail/assignSubRequest/${record.scheduleId}`,

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
