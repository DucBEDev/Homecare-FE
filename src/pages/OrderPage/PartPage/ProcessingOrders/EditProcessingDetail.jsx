import React, { useEffect, useState } from "react";
import {
  Card,
  Form,
  Input,
  Radio,
  DatePicker,
  TimePicker,
  Button,
  Row,
  Col,
  Cascader,
} from "antd";
import { Table } from "antd";
import dayjs from "dayjs";
import "../../StylePage/styleAdd.css";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import NotificationComponent from "../../../../components/NotificationComponent/NotificationComponent";

const EditProcessingOrder = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [dataFetch, setDataFetch] = useState([]);
  const location = useLocation();
  const orderId = location.state?.id;
  const [locations, setLocations] = useState([]);
  const [coefficient, setCoefficient] = useState("0");
  const [requestType, setRequestType] = useState("short");
  const [timeErrors, setTimeErrors] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [totalCost, setTotalCost] = useState(0);
  const [detailCost, setDetailCost] = useState([]); // State to store detailed cost
  const [appliedCoefficients, setAppliedCoefficients] = useState({
    overtime: null,
    weekend: null
  });

  // Fetch dữ liệu đơn hàng cụ thể
  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}admin/requests/edit/${orderId}`
        );
        console.log( "ccc", response.data);
        
        const orderData = response.data;

        // Set giá trị cho các trường trong form
        form.setFieldsValue({
          phone: orderData.request.customerInfo.phone,
          fullName: orderData.request.customerInfo.fullName,
          address: orderData.request.customerInfo.address.split(",")[0],
          serviceTitle: orderData.request.service.title,
          location: orderData.request.customerInfo.address
            .split(",")
            .slice(1)
            .map(item => item.trim()),
          requestType:
            orderData.request.requestType === "Dài hạn" ? "long" : "short",
          workDate:
            orderData.request.requestType === "Dài hạn"
              ? [ 
                  dayjs(orderData.request.startTime),
                  dayjs(orderData.request.endTime),
                ]
              : dayjs(orderData.request.startTime),
          startTime: dayjs(orderData.request.formatStartTime, "HH:mm"),
          endTime: dayjs(orderData.request.formatEndTime, "HH:mm"),
        });

        console.log(dayjs(orderData.request.startTime, "HH:mm"), "\n" , dayjs(orderData.request.endTime, "HH:mm"))

        setRequestType(
          orderData.request.requestType === "Dài hạn" ? "long" : "short"
        );
        setTotalCost(orderData.request.totalCost);
        setDetailCost(orderData.detailCost || []);
        setIsFormValid(true);
      } catch (error) {
        console.error("Error fetching order detail:", error);
        setShowNotification({
          status: "error",
          message: "Lỗi",
          description: "Không thể tải thông tin đơn hàng. Vui lòng thử lại.",
        });
      }
    };

    if (orderId) {
      fetchOrderDetail();
    }
  }, [orderId, form]);

  // Fetch data from backend for actions (locations, services, etc.)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}admin/requests/create`
        );
        setDataFetch(response.data);

        const locationResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}admin/locations`
        );
        console.log("Location Data:", locationResponse.data);
        if (locationResponse.data.success && locationResponse.data.data) {
          const formattedLocations = locationResponse.data.data.map((province) => ({
            value: province.Name || province.name,
            label: province.Name || province.name,
            children: province.Districts.map((district) => ({
              value: district.Name || district.name,
              label: district.Name || district.name,
              children: district.Wards.map((ward) => ({
                value: ward.Name || ward.name,
                label: ward.Name || ward.name,
              })),
            })),
          }));
          setLocations(formattedLocations);
        } else {
          console.error("Error fetching location data or invalid format:", locationResponse.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  //TOTAL COST
  //update cost into table
  const updateTotalCost = () => {
    const { newTotalCost, newDetailCost } = calculateTotalCost();
    setTotalCost(newTotalCost);
    setDetailCost(newDetailCost);
  };
  //calculate total cost
  const calculateTotalCost = () => {
    const formValues = form.getFieldsValue();
    const {
      serviceTitle,
      startTime,
      endTime,
      workDate,
      requestType,
    } = formValues;

    if (!serviceTitle || !startTime || !endTime || !workDate) {
      return { newTotalCost: 0, newDetailCost: [] };
    }

    const selectedService = dataFetch.serviceList?.find(
      (service) => service.title === serviceTitle
    );

    if (!selectedService) {
      return { newTotalCost: 0, newDetailCost: [] };
    }

    const basicCost = parseFloat(selectedService.basicPrice);
    const HSDV = parseFloat(selectedService.coefficient);
    const HSovertime = parseFloat(dataFetch.coefficientOtherList?.[0]?.value || 1);
    const HScuoituan = parseFloat(dataFetch.coefficientOtherList?.[1]?.value || 1);

    const start = dayjs(startTime);
    const end = dayjs(endTime);

    const officeStartTime = dayjs(dataFetch.timeList?.officeStartTime, "HH:mm");
    const officeEndTime = dayjs(dataFetch.timeList?.officeEndTime, "HH:mm");

    let totalCost = 0;
    let detailCostArray = [];

    // Hàm tính chi phí cho một ngày cụ thể
    const calculateDailyCost = (currentDate) => {
      const dayOfWeek = currentDate.day();
      const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);

      const dailyHours = end.diff(start, "hour", true);

      // Tính giờ làm việc ngoài giờ (T1) và trong giờ hành chính (T2)
      let T1 = 0; // Số giờ ngoài giờ hành chính

      // Trước giờ hành chính
      if (start.isBefore(officeStartTime)) {
        T1 += officeStartTime.diff(start, "hour", true);
      }

      // Sau giờ hành chính
      if (end.isAfter(officeEndTime)) {
        T1 += end.diff(officeEndTime, "hour", true);
      }

      // Thời gian trong giờ hành chính
      const T2 = Math.max(0, dailyHours - T1);

      // Xác định hệ số áp dụng
      const weekendCoefficient = isWeekend ? HScuoituan : 1;

      // Tính chi phí: cost = basicCost * HSDV * [(HSovertime * T1 * weekendCoefficient) + (weekendCoefficient * T2)]
      const overtimeCost = HSovertime * T1 * weekendCoefficient;
      const normalCost = weekendCoefficient * T2;
      const dayCost = basicCost * HSDV * (overtimeCost + normalCost);

      // Tạo đối tượng chi tiết cho ngày này
      return {
        date: currentDate.format("YYYY-MM-DD"),
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
        cost: dayCost // Remove rounding, keep exact value
      };
    };

    if (requestType === "long") {
      // Tính chi phí cho đơn dài hạn (nhiều ngày)
      const startDate = dayjs(workDate[0]);
      const endDate = dayjs(workDate[1]);
      let currentDate = startDate;

      while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, "day")) {
        const dailyCostDetail = calculateDailyCost(currentDate);
        detailCostArray.push(dailyCostDetail);
        totalCost += dailyCostDetail.cost;
        currentDate = currentDate.add(1, "day");
      }
    } else {
      // Tính chi phí cho đơn ngắn hạn (một ngày)
      const dailyCostDetail = calculateDailyCost(dayjs(workDate));
      detailCostArray.push(dailyCostDetail);
      totalCost = dailyCostDetail.cost;
    }

    return {
      newTotalCost: totalCost,
      newDetailCost: detailCostArray
    };
  };

  //HANDLE SET COEFFICIENT AUTOMATICALLY
  //convert time to minutes
  const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };
  //check coefficient automatically return value coefficient
  const checkCoefficient = (orderDate, startTime, endTime, timeList) => {
    if (!orderDate || !startTime || !endTime || !timeList) return "0";

    const isWeekend = checkIsWeekend(orderDate);
    const isOutsideOfficeHours = checkIsOutsideOfficeHours(startTime, endTime, timeList);

    const coefficientWeekend = dataFetch.coefficientOtherList?.[1]?.value ?? 1;
    const coefficientOutside = dataFetch.coefficientOtherList?.[0]?.value ?? 1;

    if (isWeekend) {
      return coefficientWeekend;
    }

    if (isOutsideOfficeHours) {
      return coefficientOutside;
    }

    return "1"; // Hệ số mặc định
  };

  //update coefficient into form
  const updateCoefficient = () => {
    const workDate = form.getFieldValue("workDate");
    const startTime = form.getFieldValue("startTime");
    const endTime = form.getFieldValue("endTime");

    if (workDate && startTime && endTime && dataFetch.timeList) {
      // Kiểm tra xem đơn hàng có nằm trong ngày nghỉ không
      const isWeekend = checkIsWeekend(workDate);

      // Kiểm tra xem đơn hàng có nằm ngoài giờ làm việc không
      const isOutsideOfficeHours = checkIsOutsideOfficeHours(
        dayjs(startTime),
        dayjs(endTime),
        dataFetch.timeList
      );

      // Lấy giá trị hệ số
      const coefficientWeekend = dataFetch.coefficientOtherList?.[1]?.value ?? 1;
      const coefficientOutside = dataFetch.coefficientOtherList?.[0]?.value ?? 1;

      // Cập nhật state để lưu các hệ số đang áp dụng
      setAppliedCoefficients({
        overtime: isOutsideOfficeHours ? coefficientOutside : 1,
        weekend: isWeekend ? coefficientWeekend : 1
      });

      // Xác định hệ số cao nhất để hiển thị
      let finalCoefficient = "1"; // Mặc định là 1
      if (isWeekend) {
        finalCoefficient = coefficientWeekend.toString();
      } else if (isOutsideOfficeHours) {
        finalCoefficient = coefficientOutside.toString();
      }

      setCoefficient(finalCoefficient);
    }
  };
  //once change date, update coefficient
  const handleDateChange = (date) => {
    const currentDate = dayjs();

    // Luôn cập nhật giá trị workDate vào form trước, để không làm mất chọn lựa của người dùng
    form.setFieldsValue({ workDate: date });

    // Xử lý với đơn dài hạn
    if (requestType === 'long' && Array.isArray(date)) {
      const startDate = date[0];
      const endDate = date[1];

      // Nếu ngày bắt đầu là quá khứ hoặc ngày kết thúc là quá khứ
      if (startDate.isBefore(currentDate, 'day') || endDate.isBefore(currentDate, 'day')) {
        setTimeErrors("Không thể đặt đơn cho ngày trong quá khứ. Vui lòng chọn ngày trong tương lai.");
        return;
      }

      // Nếu ngày bắt đầu là hôm nay, kiểm tra thời gian
      if (startDate.isSame(currentDate, 'day')) {
        const startTime = form.getFieldValue('startTime');
        if (startTime) {
          const start = dayjs(startTime);
          const currentHour = currentDate.hour();

          if (start.hour() <= currentHour) {
            setTimeErrors("Không thể đặt đơn dài hạn với thời gian đã qua. Vui lòng chọn thời gian trong tương lai.");
            return;
          }
        } else {
          // Nếu chưa chọn thời gian bắt đầu, chỉ hiển thị thông báo nhưng không xóa ngày
          setTimeErrors("Hãy chọn giờ bắt đầu sau thời điểm hiện tại.");
          return;
        }
      }
    }
    // Đơn ngắn hạn
    else if (date) {
      // Nếu ngày được chọn là hôm nay
      if (date.isSame(currentDate, 'day')) {
        const startTime = form.getFieldValue('startTime');
        if (startTime) {
          const start = dayjs(startTime);
          const currentHour = currentDate.hour();

          if (start.hour() <= currentHour) {
            setTimeErrors("Không thể đặt đơn với thời gian đã qua. Vui lòng chọn thời gian trong tương lai.");
            return;
          }
        } else {
          // Nếu chưa chọn thời gian bắt đầu, chỉ hiển thị thông báo
          setTimeErrors("Hãy chọn giờ bắt đầu sau thời điểm hiện tại.");
          return;
        }
      }
    }

    // Xóa lỗi nếu mọi kiểm tra đều thành công
    setTimeErrors("");

    // Cập nhật hệ số và tổng chi phí
    updateCoefficient();
    updateTotalCost();
  };

  //*HANDLE SET TIME*/
  //condition only choose hour in working time
  const disabledHours = () => {
    if (!dataFetch || !dataFetch.timeList) {
      return [];
    }

    const currentDate = dayjs();
    const selectedDate = form.getFieldValue('workDate');
    const openHour = parseInt(dataFetch.timeList.openHour.split(":")[0], 10);
    const closeHour = parseInt(dataFetch.timeList.closeHour.split(":")[0], 10);
    const hours = [];

    // Kiểm tra xem selectedDate có phải là đối tượng dayjs và có isSame method
    // Nếu selectedDate là mảng (long-term), lấy ngày đầu tiên
    const dateToCheck = Array.isArray(selectedDate) ? selectedDate[0] : selectedDate;

    // Chỉ vô hiệu hóa giờ đã qua nếu ngày được chọn là hôm nay
    if (dateToCheck && dayjs.isDayjs(dateToCheck) && dateToCheck.isSame(currentDate, 'day')) {
      const currentHour = currentDate.hour();

      for (let i = 0; i < 24; i++) {
        // Vô hiệu hóa các giờ:
        // 1. Trước giờ mở cửa
        // 2. Sau giờ đóng cửa
        // 3. Các giờ đã qua trong ngày hiện tại
        // 4. Các giờ không thể hoàn thành trước giờ đóng cửa (thêm 2 giờ tối thiểu)
        if (i < openHour ||
          i > closeHour + 1 ||
          i <= currentHour) {
          hours.push(i);
        }
      }
    } else {
      // Đối với các ngày trong tương lai, chỉ vô hiệu hóa giờ ngoài giờ làm việc
      for (let i = 0; i < 24; i++) {
        if (i < openHour || i > closeHour + 1) {
          hours.push(i);
        }
      }
    }

    return hours;
  };
  //condition only choose hour in working time
  const disabledMinutes = (selectedHour) => {
    if (!dataFetch || !dataFetch.timeList) {
      return []; //trả về một mảng phút mặc định
    }
    const closeHour = parseInt(dataFetch.timeList.closeHour.split(":")[0], 10);
    const minutes = [];
    if (selectedHour === closeHour) {
      for (let i = 1; i < 60; i++) {
        minutes.push(i);
      }
    }
    return minutes;
  };
  //condition only choose time with condition 2 hours and not 30 minutes
  const isValidTimeRange = (startTime, endTime) => {
    if (!startTime || !endTime) return false;

    const start = dayjs(startTime);
    const end = dayjs(endTime);
    const currentTime = dayjs();
    const closeHour = dayjs().set('hour', parseInt(dataFetch.timeList?.closeHour?.split(":")[0] || 23, 10)).set('minute', 0);

    const diffInHours = end.diff(start, "hour", true);

    // Lấy ngày làm việc từ form
    const workDate = form.getFieldValue("workDate");
    const isLongTerm = requestType === "long";

    // Kiểm tra xem thời gian bắt đầu đã qua chưa (chỉ áp dụng nếu ngày làm việc là hôm nay)
    const isToday = isLongTerm ?
      (Array.isArray(workDate) && workDate[0]?.isSame(currentTime, 'day')) :
      (workDate?.isSame(currentTime, 'day'));

    // Kiểm tra khoảng cách 2 tiếng từ thời điểm hiện tại
    if (isToday) {
      // Tính số giờ từ thời điểm hiện tại đến thời điểm bắt đầu
      const diffFromNow = start.diff(currentTime, "hour", true);

      // Nếu thời gian bắt đầu cách thời điểm hiện tại chưa đủ 2 tiếng
      if (diffFromNow < 2) {
        setTimeErrors("Thời gian bắt đầu phải cách thời điểm hiện tại ít nhất 2 tiếng.");
        return false;
      }
    }

    // Kiểm tra nếu thời gian kết thúc vượt quá giờ đóng cửa
    const exceedsCloseHour = end.isAfter(closeHour);
    if (exceedsCloseHour) {
      setTimeErrors("Thời gian kết thúc không được vượt quá giờ đóng cửa.");
      return false;
    }

    // Kiểm tra thời gian tối thiểu 2 giờ và không lẻ 30 phút
    if (!(diffInHours >= 2 && diffInHours % 1 === 0)) {
      setTimeErrors("Thời gian không hợp lệ. Giờ kết thúc phải cách giờ bắt đầu ít nhất 2 tiếng và không được lẻ 30 phút.");
      return false;
    }

    // Xóa lỗi nếu tất cả điều kiện đều thỏa mãn
    setTimeErrors("");
    return true;
  };
  //handle set time
  const handleTimeChange = (field, time) => {
    form.setFieldsValue({ [field]: time });

    const startTime = field === "startTime" ? time : form.getFieldValue("startTime");
    const endTime = field === "endTime" ? time : form.getFieldValue("endTime");
    const workDate = form.getFieldValue("workDate");

    if (startTime && endTime) {
      const isValid = isValidTimeRange(startTime, endTime);

      if (!isValid) {
        setIsFormValid(false);
      } else {
        // Nếu thời gian hợp lệ, hãy kiểm tra thêm với ngày hiện tại
        const currentDate = dayjs();
        const dateToCheck = Array.isArray(workDate) ? workDate[0] : workDate;

        if (dateToCheck && dateToCheck.isSame(currentDate, 'day')) {
          // Nếu thời gian bắt đầu đã qua
          const start = dayjs(startTime);
          if (start.hour() <= currentDate.hour()) {
            setTimeErrors("Không thể đặt đơn với thời gian đã qua. Vui lòng chọn thời gian trong tương lai.");
            setIsFormValid(false);
            return;
          }
        }

        setTimeErrors("");
        setIsFormValid(true);
        updateCoefficient();
        updateTotalCost();
      }
    }
  };

  const disabledDate = (current) => {
    // Không cho phép chọn ngày trong quá khứ (trước ngày hôm nay)
    return current && current < dayjs().startOf("day");
  };

  /*handle validate phone number*/
  const validatePhoneNumber = (_, value) => {
    if (!value) {
      return Promise.resolve(); // Nếu trống, trả về resolved mà không có lỗi
    }
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    if (!phoneRegex.test(value)) {
      return Promise.reject("Số điện thoại không hợp lệ!");
    }
    return Promise.resolve();
  };

  /*handle request type*/
  const handleRequestType = (value) => {
    setRequestType(value.target.value);
    updateTotalCost();
  };

  /*onFinish create order*/
  const onFinish = async (values) => {
    const {
      startTime,
      endTime,
      location,
      requestType,
      workDate,
      serviceTitle,
      ...otherValues
    } = values;

    // Tìm service được chọn
    const selectedService = dataFetch.serviceList?.find(
      (service) => service.title === serviceTitle
    );

    // Prepare data for backend
    const dataForBackend = {
      ...otherValues,
      startTime: values.startTime?.format("HH:mm"),
      endTime: values.endTime?.format("HH:mm"),
      requestType: requestType === "short" ? "Ngắn hạn" : "Dài hạn",
      serviceBasePrice: selectedService?.basicPrice,
      coefficientService: selectedService?.coefficient,
      startDate:
        requestType === "short"
          ? values.workDate?.format("YYYY-MM-DD")
          : values.workDate?.[0]?.format("YYYY-MM-DD"),
      endDate:
        requestType === "short"
          ? values.workDate?.format("YYYY-MM-DD")
          : values.workDate?.[1]?.format("YYYY-MM-DD"),
      province: values.location?.[0],
      district: values.location?.[1],
      ward: values.location?.[2],

      // Chỉ gửi các hệ số đang được áp dụng
      coefficientOt: appliedCoefficients.overtime || 1,
      coefficientOther: appliedCoefficients.weekend || 1,

      serviceTitle: values.serviceTitle,
      totalCost: totalCost,
      detailCost: detailCost, 
    };
    console.log("dtfbe", dataForBackend);
    
    try {
      const response = await axios.patch(
        `${process.env.REACT_APP_API_URL}admin/requests/edit/${orderId}`,
        dataForBackend,
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
          description: "Cập nhật đơn hàng thành công!",
        });

        setTimeout(() => {
          navigate("/order");
          setShowNotification(null);
        }, 600);
      }
    } catch (error) {
      console.error("Error updating order:", error);
      setShowNotification({
        status: "error",
        message: "Thất bại",
        description: "Không thể cập nhật đơn hàng. Vui lòng thử lại.",
      });
    }
  };

  // Hàm kiểm tra xem ngày có phải cuối tuần không
  const checkIsWeekend = (date) => {
    const saturday = 6;
    const sunday = 0;

    if (Array.isArray(date)) {
      // Trường hợp dài hạn
      const startDate = date[0];
      const endDate = date[1];
      let currentDate = startDate;

      while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
        const currentDay = currentDate.day();
        if (currentDay === saturday || currentDay === sunday) {
          return true;
        }
        currentDate = currentDate.add(1, 'day');
      }
      return false;
    } else {
      // Trường hợp ngắn hạn
      const orderDay = date.day();
      return orderDay === saturday || orderDay === sunday;
    }
  };

  // Hàm kiểm tra xem thời gian có nằm ngoài giờ làm việc không
  const checkIsOutsideOfficeHours = (startTime, endTime, timeList) => {
    const orderStartMinutes = timeToMinutes(startTime.format("HH:mm"));
    const orderEndMinutes = timeToMinutes(endTime.format("HH:mm"));

    const officeStartMinutes = timeToMinutes(timeList?.officeStartTime);
    const officeEndMinutes = timeToMinutes(timeList?.officeEndTime);
    const dayStartMinutes = timeToMinutes(timeList?.openHour);
    const dayEndMinutes = timeToMinutes(timeList?.closeHour);

    return (
      (orderStartMinutes >= dayStartMinutes && orderStartMinutes < officeStartMinutes) ||
      (orderEndMinutes > officeEndMinutes && orderEndMinutes <= dayEndMinutes)
    );
  };

  return (
    <Card className="card" title="Thông tin đơn hàng">
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        style={{ marginTop: "12px" }}
      >
        <Row>
          <Col span={10}>
            <Form.Item
              name="phone"
              label="Số điện thoại KH"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại!" },
                { validator: validatePhoneNumber },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="fullName"
              label="Họ và tên KH"
              rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row>
          <Col span={10}>
            <Form.Item
              name="address"
              label="Địa chỉ khách hàng"
              rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={8} className="location-custom">
            <Form.Item
              name="location" // Name for the location data in form values
              label="Địa điểm"
              rules={[{ required: true, message: "Vui lòng chọn địa điểm!" }]}
            >
              <Cascader
                options={locations}
                placeholder="Chọn Tỉnh/Thành phố, Quận/Huyện, Phường/Xã"
                showSearch
                changeOnSelect
                className="cascader-custom"
              />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={7}>
            <Form.Item
              name="serviceTitle"
              label="Loại dịch dụ"
              rules={[{ required: true, message: "Vui lòng chọn dịch vụ!" }]}
            >
              <Radio.Group
                className="service-radio-group"
                onChange={updateTotalCost}
                value={form.getFieldValue("serviceTitle")}
              >
                {dataFetch &&
                  dataFetch.serviceList &&
                  dataFetch.serviceList.length > 0 ? (
                    dataFetch.serviceList.map((service, index) => (
                      <Radio key={index} value={service.title}>
                        {service.title}
                      </Radio>
                    ))
                  ) : (
                    <div>Đang tải dịch vụ...</div>
                  )}
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col span={5}>
            <Form.Item name="requestType" label="Loại yêu cầu">
              <Radio.Group
                onChange={handleRequestType}
                value={form.getFieldValue("requestType")}
              >
                <Radio value="short">Ngắn hạn</Radio>
                <Radio value="long">Dài hạn</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col span={12} style={{ marginTop: "0px" }}>
            <Form.Item
              name="workDate"
              label={
                requestType === "short"
                  ? "Ngày làm việc"
                  : "Khoảng Thời Gian Làm Việc"
              }
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn thời gian làm việc!",
                },
              ]}
            >
              {requestType === "short" ? (
                <DatePicker
                  onChange={handleDateChange}
                  disabledDate={disabledDate}
                />
              ) : (
                <DatePicker.RangePicker
                  onChange={handleDateChange}
                  disabledDate={disabledDate}
                />
              )}
            </Form.Item>
          </Col>
        </Row>

        <Row>
          <Col span={3} style={{ marginRight: "18px" }}>
            <Form.Item
              name="startTime"
              label="Giờ bắt đầu"
              rules={[
                { required: true, message: "Vui lòng chọn giờ bắt đầu!" },
              ]}
            >
              <TimePicker
                format="HH:mm"
                hourStep={1}
                minuteStep={30}
                allowClear={false}
                onChange={(time) => handleTimeChange("startTime", time)}
                disabledHours={disabledHours}
                disabledMinutes={disabledMinutes}
                hideDisabledOptions={true}
              />
            </Form.Item>
          </Col>
          <Col span={3} style={{ marginRight: "18px" }}>
            <Form.Item
              name="endTime"
              label="Giờ kết thúc"
              rules={[
                { required: true, message: "Vui lòng chọn giờ kết thúc!" },
              ]}
            >
              <TimePicker
                format="HH:mm"
                hourStep={1}
                minuteStep={30}
                allowClear={false}
                onChange={(time) => handleTimeChange("endTime", time)}
                disabledHours={disabledHours}
                disabledMinutes={disabledMinutes}
                hideDisabledOptions={true}
              />
            </Form.Item>
          </Col>
        </Row>

        {timeErrors && (
          <div style={{ color: "red", marginBottom: "10px" }}>{timeErrors}</div>
        )}

        <Table
          columns={[
            {
              title: "Tổng Chi Phí",
              dataIndex: "totalCost",
              key: "totalCost",
              render: () => (
                <span style={{ color: "#32d48a", fontWeight: "bold" }}>
                  {totalCost.toLocaleString()} VND
                </span>
              ),
            },
          ]}
          dataSource={[{ key: "1" }]}
          pagination={false}
          bordered
          className="table-custom"
        />

        <Form.Item style={{ marginTop: "40px" }}>
          <Button type="primary" htmlType="submit" disabled={!isFormValid}>
            Cập nhật
          </Button>
        </Form.Item>
      </Form>

      {showNotification && (
        <NotificationComponent
          status={showNotification.status}
          message={showNotification.message}
          description={showNotification.description}
        />
      )}
    </Card>
  );
};

export default EditProcessingOrder;