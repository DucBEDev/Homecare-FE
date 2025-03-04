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
import { useNavigate } from "react-router-dom";
import NotificationComponent from "../../../../components/NotificationComponent/NotificationComponent";

const AddOrder = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [dataFetch, setDataFetch] = useState([]);

  const [locations, setLocations] = useState([]); // State for location data
  const [coefficient, setCoefficient] = useState("0");
  const [requestType, setRequestType] = useState("short");
  const [timeErrors, setTimeErrors] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [totalCost, setTotalCost] = useState(0);

  //fetch data from backend for actions
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}admin/requests/create`
        );
        console.log("responsaaaaaaaaaaaaaae", response);
        setDataFetch(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  //FETCH LOCATION DATA FROM SEPARATE API
  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}admin/locations`
        );
        console.log("Location Data:", response.data);
        if (response.data.success && response.data.data) {
          // Format the location data into the Cascader options format
          const formattedLocations = response.data.data.map((province) => ({
            value: province.Name || province.name, // Use either Name or name
            label: province.Name || province.name,
            children: province.Districts.map((district) => ({
              value: district.Name || district.name, // Use either Name or name
              label: district.Name || district.name,
              children: district.Wards.map((ward) => ({
                value: ward.Name || ward.name, // Use either Name or name
                label: ward.Name || ward.name,
              })),
            })),
          }));
          setLocations(formattedLocations);
        } else {
          console.error("Error fetching location data or invalid format:", response.data);
        }
      } catch (error) {
        console.error("Error fetching location data:", error);
      }
    };

    fetchLocationData();
  }, []);

  //TOTAL COST
  //update cost into table
  const updateTotalCost = () => {
    const newTotalCost = calculateTotalCost();
    setTotalCost(newTotalCost);
  };
  //calculate total cost
  const calculateTotalCost = () => {
    const formValues = form.getFieldsValue();
    const {
      serviceTitle,
      startTime,
      endTime,
      workDate,
      coefficient_other,
      requestType,
    } = formValues;
  
    // Return early if required fields are missing
    if (!serviceTitle || !startTime || !endTime || !workDate || !coefficient_other) {
      return 0;
    }
  
    const selectedService = dataFetch.serviceList.find(
      (service) => service.title === serviceTitle
    );
  
    if (!selectedService) {
      return 0;
    }
  
    // Parse values as floats to ensure proper number calculations
    const basicCost = parseFloat(selectedService.basicPrice);
    const HSDV = parseFloat(selectedService.coefficient); // Service coefficient
    const HSovertime = parseFloat(dataFetch.coefficientOtherList[0].value); // Overtime coefficient
    const HScuoituan = parseFloat(dataFetch.coefficientOtherList[1].value); // Weekend coefficient
    // If you have holiday coefficient, you would add it here
    // const HSle = parseFloat(dataFetch.coefficientOtherList[2].value);
  
    const start = dayjs(startTime);
    const end = dayjs(endTime);
  
    const officeStartTime = dayjs(dataFetch.timeList.officeStartTime, "HH:mm");
    const officeEndTime = dayjs(dataFetch.timeList.officeEndTime, "HH:mm");
  
    let totalCost = 0;
  
    if (requestType === "long") {
      // Long-term request (multiple days)
      const startDate = dayjs(workDate[0]);
      const endDate = dayjs(workDate[1]);
      let currentDate = startDate;
  
      while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, "day")) {
        const dayOfWeek = currentDate.day();
        const dailyHours = Math.floor(end.diff(start, "hour"));
        
        // Calculate overtime hours (T1) and normal hours (T2)
        let T1 = 0; // Overtime hours
        let T2 = 0; // Normal hours
        
        // Calculate overtime before office hours
        if (start.isBefore(officeStartTime)) {
          T1 += Math.floor(officeStartTime.diff(start, "hour"));
        }
        
        // Calculate overtime after office hours
        if (end.isAfter(officeEndTime)) {
          T1 += Math.floor(end.diff(officeEndTime, "hour"));
        }
        
        // Calculate normal hours
        T2 = Math.max(0, dailyHours - T1);
        
        // Determine if it's a weekend
        const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);
        
        // Apply weekend coefficient if applicable
        const applicableWeekendCoefficient = isWeekend ? HScuoituan : 1;
        
        // Calculate cost based on your formula:
        // cost = basicCost * HSDV * [(HSovertime * T1 * max(Hscuoituan, lễ)(if applicable)) + (max(Hscuoituan, lễ) * T2)]
        const overtimeCost = HSovertime * T1 * applicableWeekendCoefficient;
        const normalCost = applicableWeekendCoefficient * T2;
        
        // No T3 in the provided information, so assuming T3 = 0
        
        const dailyCost = Math.floor(basicCost * HSDV * (overtimeCost + normalCost));
        
        totalCost += dailyCost;
        currentDate = currentDate.add(1, "day");
      }
    } else {
      // Short-term request (single day)
      const dayOfWeek = dayjs(workDate).day();
      const dailyHours = Math.floor(end.diff(start, "hour"));
      
      // Calculate overtime hours (T1) and normal hours (T2)
      let T1 = 0; // Overtime hours
      let T2 = 0; // Normal hours
      
      // Calculate overtime before office hours
      if (start.isBefore(officeStartTime)) {
        T1 += Math.floor(officeStartTime.diff(start, "hour"));
      }
      
      // Calculate overtime after office hours
      if (end.isAfter(officeEndTime)) {
        T1 += Math.floor(end.diff(officeEndTime, "hour"));
      }
      
      // Calculate normal hours
      T2 = Math.max(0, dailyHours - T1);
      
      // Determine if it's a weekend
      const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);
      
      // Apply weekend coefficient if applicable
      const applicableWeekendCoefficient = isWeekend ? HScuoituan : 1;
      console.log(applicableWeekendCoefficient);
      
      // Calculate cost based on your formula:
      // cost = basicCost * HSDV * [(HSovertime * T1 * max(Hscuoituan, lễ)(if applicable)) + (max(Hscuoituan, lễ) * T2)]
      const overtimeCost = HSovertime * T1 * applicableWeekendCoefficient;
      const normalCost = applicableWeekendCoefficient * T2;
      
      // No T3 in the provided information, so assuming T3 = 0
      
      totalCost = Math.floor(basicCost * HSDV * (overtimeCost + normalCost));
    }
    
    // Final rounding to ensure integer cost
    return Math.floor(totalCost/1000) * 1000;
  };
  //HANDLE SET COEFFICIENT AUTOMATICALLY
  //convert time to minutes
  const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };
  //check coefficient automatically return value coefficient
  const checkCoefficient = (orderDate, startTime, endTime, timeList) => {
    const saturday = 6;
    const sunday = 0;
  
    if (!orderDate || !startTime || !endTime || !timeList) return "0";
  
    const orderStartMinutes = timeToMinutes(startTime.format("HH:mm"));
    const orderEndMinutes = timeToMinutes(endTime.format("HH:mm"));
  
    const officeStartMinutes = timeToMinutes(timeList.officeStartTime);
    const officeEndMinutes = timeToMinutes(timeList.officeEndTime);
    const dayStartMinutes = timeToMinutes(timeList.openHour);
    const dayEndMinutes = timeToMinutes(timeList.closeHour);
  
    const coefficientWeekend = dataFetch.coefficientOtherList[1].value;
    const coefficientOutside = dataFetch.coefficientOtherList[0].value;
    const coefficientNormal = "1";
  
    // Check if we're dealing with a date range (long-term request)
    if (Array.isArray(orderDate)) {
      // Get the start and end dates from the array
      const startDate = orderDate[0];
      const endDate = orderDate[1];
      
      // Check if any day in the range is a weekend
      let hasWeekend = false;
      let currentDate = startDate.clone();
      
      while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
        const currentDay = currentDate.day();
        if (currentDay === saturday || currentDay === sunday) {
          hasWeekend = true;
          break;
        }
        currentDate = currentDate.add(1, 'day');
      }
      
      if (hasWeekend) {
        return coefficientWeekend;
      }
      
      // If no weekend, check for outside office hours
      if (
        (orderStartMinutes >= dayStartMinutes && orderStartMinutes < officeStartMinutes) ||
        (orderEndMinutes > officeEndMinutes && orderEndMinutes <= dayEndMinutes)
      ) {
        return coefficientOutside;
      }
      
      return coefficientNormal;
    } else {
      // Single date (short-term request)
      const orderDay = orderDate.day();
      console.log("orderDayyyyyyyyyyyyyyy", orderDay);
      
      if (orderDay === saturday || orderDay === sunday) {
        return coefficientWeekend;
      }
      
      // Check for outside office hours
      if (
        (orderStartMinutes >= dayStartMinutes && orderStartMinutes < officeStartMinutes) ||
        (orderEndMinutes > officeEndMinutes && orderEndMinutes <= dayEndMinutes)
      ) {
        return coefficientOutside; // Outside office hours coefficient
      }
      
      return coefficientNormal; // Default to normal coefficient
    }
  };

  //update coefficient into form
  const updateCoefficient = () => {
    const workDate = form.getFieldValue("workDate");
    const startTime = form.getFieldValue("startTime");
    const endTime = form.getFieldValue("endTime");
  
    if (workDate && startTime && endTime && dataFetch.timeList) {
      // Handle both single date and date range
      const newCoefficient = checkCoefficient(
        workDate, // Pass workDate directly, whether it's a single date or array
        dayjs(startTime),
        dayjs(endTime),
        dataFetch.timeList
      );
      setCoefficient(newCoefficient);
      form.setFieldsValue({ coefficient_other: newCoefficient });
    }
  };
  //once change date, update coefficient
  const handleDateChange = (date) => {
    form.setFieldsValue({ workDate: date });
    updateCoefficient();
    updateTotalCost();
  };

  //*HANDLE SET TIME*/
  //condition only choose hour in working time
  const disabledHours = () => {
    if (!dataFetch || !dataFetch.timeList) { 
      return []; // trả về một mảng giờ mặc định
    }
    const openHour = parseInt(dataFetch.timeList.openHour.split(":")[0], 10);
    const closeHour = parseInt(dataFetch.timeList.closeHour.split(":")[0], 10);
    const hours = [];
    for (let i = 0; i < 24; i++) {
      if (i < openHour || i - 1 > closeHour) {
        hours.push(i);
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

    const diffInHours = end.diff(start, "hour", true);

    return diffInHours >= 2 && diffInHours % 1 === 0;
  };
  //handle set time
  const handleTimeChange = (field, time) => {
    form.setFieldsValue({ [field]: time });

    updateCoefficient();
    updateTotalCost();

    const startTime =
      field === "startTime" ? time : form.getFieldValue("startTime");
    const endTime = field === "endTime" ? time : form.getFieldValue("endTime");
    console.log(startTime, endTime);
    if (startTime && endTime) {
      const isValid = isValidTimeRange(startTime, endTime);
      if (!isValid) {
        setTimeErrors(
          "Thời gian không hợp lệ. Giờ kết thúc phải cách giờ bắt đầu ít nhất 2 tiếng và không được lẻ 30 phút."
        );
        setIsFormValid(false);
      } else {
        setTimeErrors("");
        setIsFormValid(true);
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
    console.log("valueeeeeeeeeeee", value);
    setRequestType(value.target.value);
    updateTotalCost();
  };

  /*fetch location data*/
  // useEffect(() => {
  //   if (dataFetch && dataFetch.locations) {
  //     const formattedLocations = dataFetch.locations.map((province) => ({
  //       value: province.Name,
  //       label: province.Name,
  //       children: province.Districts.map((district) => ({
  //         value: district.Name,
  //         label: district.Name,
  //         children: district.Wards.map((ward) => ({
  //           value: ward.Name,
  //           label: ward.Name,
  //         })),
  //       })),
  //     }));
  //     setLocations(formattedLocations);
  //   }
  // }, [dataFetch]);

  /*onFinish create order*/
  const onFinish = (values) => {
    console.log("test value", values);
    const {
      startTime,
      endTime,
      location,
      requestType,
      workDate,
      serviceTitle,
      ...otherValues
    } = values;

    // Prepare data for backend
    const dataForBackend = {
      ...otherValues,
      startTime: values.startTime?.format("HH:mm"),
      endTime: values.endTime?.format("HH:mm"),
      requestType: requestType === "short" ? "Ngắn hạn" : "Dài hạn",
      serviceBasePrice: dataFetch?.serviceList?.find(
        (item) => item.title === values.serviceTitle
      )?.basicPrice,
      coefficient_service: dataFetch?.serviceList?.find(
        (item) => item.title === values.serviceTitle
      )?.coefficient,
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
      coefficient_other: values.coefficient_other,
      serviceTitle: values.serviceTitle,
      totalCost: totalCost,
    };

    // Send data to backend
    console.log("dttaforbe", dataForBackend);
    axios
      .post(
        `${process.env.REACT_APP_API_URL}admin/requests/create`,
        dataForBackend,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        if (!response) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response;
      })
      .then((data) => {
        console.log("Response from backend:", data);
        console.log(dataForBackend);
        setShowNotification({
          status: "success",
          message: "Thành công",
          description: "Đơn hàng đã được tạo thành công!",
        });

        setTimeout(() => {
          // navigate("/order");
          setShowNotification(null);
        }, 600);
      })
      .catch((error) => {
        console.error("Error sending data to backend:", error);
        setShowNotification({
          status: "error",
          message: "Thất bại",
          description: "Không thể tạo đơn hàng. Vui lòng thử lại.",
        });
      });
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
              <Radio.Group onChange={handleRequestType}>
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
          <Col span={3} style={{marginRight:"18px"}}>
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
          <Col span={3} style={{marginRight:"18px"}}>
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
          <Col span={3}>
            <Form.Item
              name="coefficient_other"
              label="Hệ số"
              rules={[
                {required: true}
              ]}
            >
              <Input disabled value={coefficient} style={{height: "38px", width: "80%"}}/>
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
            Tạo Yêu Cầu
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

export default AddOrder;