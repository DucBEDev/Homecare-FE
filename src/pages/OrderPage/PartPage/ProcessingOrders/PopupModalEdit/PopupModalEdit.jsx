import React, { useCallback, useEffect, useState } from "react";
import { Modal, Button, Row, Col, TimePicker, message, Spin } from "antd";
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
  const [totalCost, setTotalCost] = useState(0);
  const [detailCost, setDetailCost] = useState([]);
  const [serviceBasePrice, setServiceBasePrice] = useState(0);
  const [isCalculatingCost, setIsCalculatingCost] = useState(true);

  useEffect(() => {
    if (record) {
      setEditedRecord({
        ...record,
        gioBatDauMoi: record.gioBatDau,
        gioKetThucMoi: record.gioKetThuc,
      });
      setIsFormValid(true);
      setTimeErrors("");
      
      // Fetch service base price if needed
      fetchServiceBasePrice();
    }
  }, [record]);

  // Fetch service base price
  const fetchServiceBasePrice = async () => {
    try {
      if (record && record.mainOrderId) {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}admin/requests/detail/${record.mainOrderId}`
        );
        
        if (response.data && response.data.request && response.data.request.service) {
          setServiceBasePrice(response.data.request.service.cost || 0);
        }
      }
    } catch (error) {
      console.error("Error fetching service base price:", error);
    }
  };

  // Calculate total cost function from AddOrder.jsx
  const calculateTotalCost = useCallback((startTime, endTime, workDate) => {
    if (!startTime || !endTime || !timeList) {
      return { newTotalCost: 0, newDetailCost: [] };
    }

    // Get service data from record
    const basicCost = parseFloat(serviceBasePrice || 0);
    const HSDV = parseFloat(record.coefficient_service || 1);
    const HSovertime = parseFloat(record.coefficientOtherList?.[0]?.value || 1);
    const HScuoituan = parseFloat(record.coefficientOtherList?.[1]?.value || 1);

    const start = dayjs(startTime, "HH:mm");
    const end = dayjs(endTime, "HH:mm");
    
    const officeStartTime = dayjs(timeList.officeStartTime, "HH:mm");
    const officeEndTime = dayjs(timeList.officeEndTime, "HH:mm");

    let totalCost = 0;
    let detailCostArray = [];

    // Calculate cost for a specific day
    const calculateDailyCost = (currentDate) => {
      // Convert string date to dayjs object if needed
      const dateObj = typeof currentDate === 'string' ? dayjs(currentDate) : currentDate;
      
      const dayOfWeek = dateObj.day();
      const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);
      
      const dailyHours = end.diff(start, "hour", true);
      
      // Calculate overtime hours (T1) and regular hours (T2)
      let T1 = 0; // Overtime hours
      
      // Before office hours
      if (start.isBefore(officeStartTime)) {
        T1 += officeStartTime.diff(start, "hour", true);
      }
      
      // After office hours
      if (end.isAfter(officeEndTime)) {
        T1 += end.diff(officeEndTime, "hour", true);
      }
      
      // Regular hours
      const T2 = Math.max(0, dailyHours - T1);
      
      // Determine applied coefficient
      const weekendCoefficient = isWeekend ? HScuoituan : 1;
      
      // Calculate cost: cost = basicCost * HSDV * [(HSovertime * T1 * weekendCoefficient) + (weekendCoefficient * T2)]
      const overtimeCost = HSovertime * T1 * weekendCoefficient;
      const normalCost = weekendCoefficient * T2;
      const dayCost = basicCost * HSDV * (overtimeCost + normalCost);
      
      // Create detail object for this day
      return {
        date: dateObj.format("YYYY-MM-DD"),
        startTime: start.format("HH:mm"),
        endTime: end.format("HH:mm"),
        isWeekend: isWeekend,
        hasOvertimeHours: T1 > 0,
        overtimeHours: T1,
        normalHours: T2,
        appliedCoefficients: {
          service: HSDV,
          overtime: HSovertime,
          weekend: weekendCoefficient
        },
        cost: dayCost
      };
    };

    // Calculate cost for the specific day
    // Use the raw workingDate from the record if available
    const dateToUse = record.workingDate || workDate;
    const dailyCostDetail = calculateDailyCost(dateToUse);
    detailCostArray.push(dailyCostDetail);
    totalCost = dailyCostDetail.cost;
    
    return { 
      newTotalCost: totalCost,
      newDetailCost: detailCostArray
    };
  }, [timeList, serviceBasePrice, record]);

  useEffect(() => {
    const fetchTimeData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}admin/requests/create`
        );
        setTimeList(response.data.timeList);
        
        
      } catch (error) {
        console.error("Error fetching time data:", error);
      }
    };
    fetchTimeData();
  }, []);

  // useEffect mới để tính toán chi phí
  useEffect(() => {
    // Kiểm tra xem tất cả dữ liệu cần thiết đã sẵn sàng chưa
    if (
      editedRecord?.gioBatDauMoi &&
      editedRecord?.gioKetThucMoi &&
      timeList &&
      serviceBasePrice > 0 && // Đảm bảo giá dịch vụ đã được fetch
      record?.workingDate &&
      isFormValid // Chỉ tính khi form hợp lệ
    ) {
      setIsCalculatingCost(true); // <-- Bắt đầu loading

      // Sử dụng setTimeout để đảm bảo state loading được cập nhật trước khi tính toán nặng (nếu cần)
      // và cũng để người dùng thấy được trạng thái loading một cách rõ ràng hơn.
      const timer = setTimeout(() => {
          const { newTotalCost, newDetailCost } = calculateTotalCost(
            editedRecord.gioBatDauMoi,
            editedRecord.gioKetThucMoi,
            record.workingDate
          );
          setTotalCost(newTotalCost);
          setDetailCost(newDetailCost);
          setIsCalculatingCost(false); // <-- Kết thúc loading
      }, 50); // Delay nhỏ 50ms

      // Cleanup timer nếu component unmount hoặc dependencies thay đổi trước khi timeout kết thúc
       return () => clearTimeout(timer);

    } else if (!isFormValid) {
        // Nếu form không hợp lệ, không tính toán và ẩn loading
        setTotalCost(0); // Có thể reset chi phí về 0
        setDetailCost([]);
        setIsCalculatingCost(false);
    } else {
        // Nếu dữ liệu chưa đủ, giữ trạng thái loading (hoặc set false nếu muốn ẩn)
        // setIsCalculatingCost(true); // Đảm bảo vẫn loading nếu thiếu dữ liệu
    }
  }, [
    editedRecord?.gioBatDauMoi,
    editedRecord?.gioKetThucMoi,
    timeList,
    serviceBasePrice,
    record?.workingDate,
    calculateTotalCost, // Thêm calculateTotalCost (đã bọc useCallback) vào dependencies
    isFormValid // Thêm isFormValid để không tính toán khi giờ không hợp lệ
  ]);

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
      // Find the correct helper with matching helperId
      const selectedHelper = editedRecord.helpers.find(
        (helper) => editedRecord.currentHelperId === helper.helperId
      );

      const payload = {
        startTime: editedRecord.gioBatDauMoi,
        endTime: editedRecord.gioKetThucMoi,
        helper_baseFactor: selectedHelper?.baseFactor || 0,
        coefficient_other: editedRecord.coefficient_other,
        coefficient_OT: editedRecord.coefficientOtherList[0].value,
        coefficient_service: editedRecord.coefficient_service,
        totalCost: totalCost,
        detailCost: detailCost
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
          <Col span={24}>
            <div className="info-item">
              <span>Chi phí mới:</span>
              {isCalculatingCost ? ( // <-- Kiểm tra trạng thái loading
                <Spin size="small" style={{ marginLeft: '10px' }} /> // <-- Hiển thị Spin nếu đang loading
              ) : (
                <span style={{ color: isFormValid ? "#32d48a" : "#ccc", fontWeight: "bold" }}> {/* Thay đổi màu nếu không hợp lệ */}
                   {isFormValid ? `${totalCost.toLocaleString()} VND` : 'N/A'} {/* Hiển thị N/A nếu không hợp lệ */}
                </span>
              )}
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
