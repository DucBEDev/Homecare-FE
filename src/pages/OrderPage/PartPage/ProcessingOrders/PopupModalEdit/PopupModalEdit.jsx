import React, { useEffect, useState } from "react";
import { Modal, Button, Row, Col, TimePicker, message } from "antd";
import dayjs from "dayjs";
import "../../../StylePage/stylePopupModalEdit.css";
import axios from "axios";
import NotificationComponent from "../../../../../components/NotificationComponent/NotificationComponent";

const PopupModalEdit = ({ isVisible, onClose, onEdit, record, orderData }) => {
  const [editedRecord, setEditedRecord] = useState(null);
  const [timeErrors, setTimeErrors] = useState("");
  const [isFormValid, setIsFormValid] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [timeList, setTimeList] = useState(null);

  useEffect(() => {
    if (record) {
      setEditedRecord({
        ...record,
        gioBatDauMoi: record.gioBatDau,
        gioKetThucMoi: record.gioKetThuc,
      });
      setIsFormValid(true);
      setTimeErrors("");
    }
  }, [record]);

  const handleTimeChange = (field, time) => {
    const newTime = time ? time.format("HH:mm") : null;

    setEditedRecord((prev) => {
      const updatedRecord = { ...prev, [field]: newTime };

      // Nếu đang cập nhật giờ bắt đầu, kiểm tra và điều chỉnh giờ kết thúc nếu cần
      if (field === "gioBatDauMoi" && updatedRecord.gioKetThucMoi) {
        const isValid = isValidTimeRange(newTime, updatedRecord.gioKetThucMoi);
        if (!isValid) {
          const newEndTime = dayjs(newTime, "HH:mm")
            .add(2, "hour")
            .format("HH:mm");
          updatedRecord.gioKetThucMoi = newEndTime;
        } else {
          setTimeErrors("");
        }
      }

      // Nếu đang cập nhật giờ kết thúc, kiểm tra và điều chỉnh nếu không hợp lệ
      if (field === "gioKetThucMoi" && updatedRecord.gioBatDauMoi) {
        const isValid = isValidTimeRange(updatedRecord.gioBatDauMoi, newTime);
        if (!isValid) {
          const newEndTime = dayjs(updatedRecord.gioKetThucMoi, "HH:mm")
            .add(0, "hour")
            .format("HH:mm");
          updatedRecord.gioKetThucMoi = newEndTime;
          setTimeErrors(
            "Thời gian không hợp lệ. Giờ kết thúc phải cách giờ bắt đầu ít nhất 2 tiếng và không được lẻ 30 phút."
          );
        } else {
          setTimeErrors("");
        }
      }
      setIsFormValid(
        isValidTimeRange(
          updatedRecord.gioBatDauMoi,
          updatedRecord.gioKetThucMoi
        )
      );

      return updatedRecord;
    });
  };

  const isValidTimeRange = (startTime, endTime) => {
    if (!startTime || !endTime) return false;

    const start = dayjs(startTime, "HH:mm");
    const end = dayjs(endTime, "HH:mm");

    const diffInHours = end.diff(start, "hour", true);

    // Kiểm tra nếu thời gian kết thúc cách thời gian bắt đầu ít nhất 2 tiếng
    // và không lẻ 30 phút
    return diffInHours >= 2 && diffInHours % 1 === 0;
  };

  useEffect(() => {
    const fetchTimeData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}admin/requests/create`
        );
        setTimeList(response.data.timeList);
        console.log("timeList", timeList);
      } catch (error) {
        console.error("Error fetching time data:", error);
      }
    };
    fetchTimeData();
  }, []);

  // Update the disabled hours function
  const disabledHours = () => {
    if (!timeList) return [];

    const openHour = parseInt(timeList.openHour.split(":")[0], 10);
    const closeHour = parseInt(timeList.closeHour.split(":")[0], 10);
    const hours = [];

    for (let i = 0; i < 24; i++) {
      if (i < openHour || i  > closeHour) {
        hours.push(i);
      }
    }
    return hours;
  };

  // Update the disabled minutes function
  const disabledMinutes = (selectedHour) => {
    if (!timeList) return [];

    const closeHour = parseInt(timeList.closeHour.split(":")[0], 10);
    const minutes = [];

    if (selectedHour === closeHour) {
      for (let i = 1; i < 60; i++) {
        minutes.push(i);
      }
    }
    return minutes;
  };

  if (!editedRecord) return null;

  const handleSave = async (editedRecord) => {
    try {
      const payload = {
        startTime: editedRecord.gioBatDauMoi,
        endTime: editedRecord.gioKetThucMoi,
      };

      console.log("payload edit:", payload);

      const response = await axios.patch(
        `${process.env.REACT_APP_API_URL}admin/requests/detail/changeTime/${record.scheduleId}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        setShowNotification({
          status: "success",
          message: "Thành công",
          description: "Cập nhật thời gian thành công!",
        });

        if (onEdit) {
          onEdit();
        }

        // Đóng modal 
        setTimeout(() => {
          setShowNotification(false);
          onClose();
        }, 0);
      }
    } catch (error) {
      // Xử lý lỗi
      console.error("Error sending data to backend:", error);
      setShowNotification({
        status: "error",
        message: "Thất bại",
        description: "Không thể sửa. Vui lòng thử lại.",
      });
       // Đóng modal 
       setTimeout(() => {
        setShowNotification(false);
        onClose();
      }, 0);
    }
  };

  return (
    <Modal
      title="Thay đổi thời gian của chi tiết yêu cầu"
      visible={isVisible}
      onCancel={onClose}
      footer={[
        <Button
          key="save"
          type="primary"
          onClick={() => handleSave(editedRecord)}
          disabled={!isFormValid}
        >
          Lưu lại
        </Button>,
        <Button key="cancel" onClick={onClose}>
          Đóng
        </Button>,
      ]}
      width={800}
    >
      <div className="popup-content">
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <div className="info-item">
              <span>Số ĐT Khách Hàng:</span>
              <span>{orderData?.soDTKhachHang}</span>
            </div>
          </Col>
          <Col span={12}>
            <div className="info-item">
              <span>Loại Yêu Cầu:</span>
              <span>{orderData?.loaiYeuCau}</span>
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
              <span>Ngày Làm:</span>
              <span>{editedRecord.ngayLam}</span>
            </div>
          </Col>
          <Col span={12}>
            <div className="info-item">
              <span>Giờ Bắt Đầu Cũ:</span>
              <span>{editedRecord.gioBatDau}</span>
            </div>
          </Col>
          <Col span={12}>
            <div className="info-item">
              <span>Giờ Kết Thúc Cũ:</span>
              <span>{editedRecord.gioKetThuc}</span>
            </div>
          </Col>
          <Col span={12}>
            <div className="info-item">
              <span>Giờ Bắt Đầu Mới:</span>
              <TimePicker
                size="small"
                className="custom-time-picker"
                value={
                  editedRecord.gioBatDauMoi
                    ? dayjs(editedRecord.gioBatDauMoi, "HH:mm")
                    : null
                }
                onChange={(time) => handleTimeChange("gioBatDauMoi", time)}
                format="HH:mm"
                popupClassName="custom-time-picker-dropdown"
                hourStep={1}
                minuteStep={30}
                allowClear={false}
                disabledHours={disabledHours}
                disabledMinutes={disabledMinutes}
                hideDisabledOptions={true}
              />
            </div>
          </Col>
          <Col span={12}>
            <div className="info-item">
              <span>Giờ Kết Thúc Mới:</span>
              <TimePicker
                size="small"
                className="custom-time-picker"
                value={
                  editedRecord.gioKetThucMoi
                    ? dayjs(editedRecord.gioKetThucMoi, "HH:mm")
                    : null
                }
                onChange={(time) => handleTimeChange("gioKetThucMoi", time)}
                format="HH:mm"
                popupClassName="custom-time-picker-dropdown"
                hourStep={1}
                minuteStep={30}
                allowClear={false}
                disabledHours={disabledHours}
                disabledMinutes={disabledMinutes}
                hideDisabledOptions={true}
              />
            </div>
          </Col>
          <div className="error-message">{timeErrors}</div>
        </Row>
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

export default PopupModalEdit;
