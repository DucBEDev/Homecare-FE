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
// const { Option } = Select;

const AddOrder = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [dataFetch, setDataFetch] = useState([]);

  const [locations, setLocations] = useState([]);
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

    if (
      !serviceTitle ||
      !startTime ||
      !endTime ||
      !workDate ||
      !coefficient_other
    ) {
      return 0;
    }

    const selectedService = dataFetch.serviceList.find(
      (service) => service.title === serviceTitle
    );

    if (!selectedService) {
      return 0;
    }

    const { basicPrice, coefficient: coefficient_service } = selectedService;
    const coefficientWeekend = parseFloat(
      dataFetch.coefficientOtherList[1].value
    ); // Hệ số cố định cho thứ 7 và chủ nhật
    const coefficientOvertime = parseFloat(
      dataFetch.coefficientOtherList[0].value
    );

    const start = dayjs(startTime);
    const end = dayjs(endTime);

    const officeStartTime = dayjs(dataFetch.timeList.officeStartTime, "HH:mm");
    const officeEndTime = dayjs(dataFetch.timeList.officeEndTime, "HH:mm");

    let totalCost = 0;

    if (requestType === "long") {
      const startDate = dayjs(workDate[0]);
      const endDate = dayjs(workDate[1]);
      let currentDate = startDate;

      while (
        currentDate.isBefore(endDate) ||
        currentDate.isSame(endDate, "day")
      ) {
        const dayOfWeek = currentDate.day();
        const dailyHours = end.diff(start, "hour");

        if (dayOfWeek === 0 || dayOfWeek === 6) { //cuoi tuan t7 cn
          let normalHours = 0;
          let overtimeHours = 0;

          if (start.isBefore(officeStartTime)) {
            overtimeHours += officeStartTime.diff(start, "hour");
          }
          if (end.isAfter(officeEndTime)) {
            overtimeHours += end.diff(officeEndTime, "hour");
          }
          normalHours = dailyHours - overtimeHours;

          const weekendCost = basicPrice * normalHours * coefficient_service * coefficientWeekend;
          const overtimeCost =
            basicPrice *
            overtimeHours *
            coefficient_service *
            coefficientWeekend *
            coefficientOvertime;
          totalCost += weekendCost + overtimeCost;
        } else {
          // Ngày trong tuần
          let normalHours = 0;
          let overtimeHours = 0;

          if (start.isBefore(officeStartTime)) {
            overtimeHours += officeStartTime.diff(start, "hour");
          }
          if (end.isAfter(officeEndTime)) {
            overtimeHours += end.diff(officeEndTime, "hour");
          }
          normalHours = dailyHours - overtimeHours;

          const normalCost = basicPrice * normalHours * coefficient_service;
          const overtimeCost =
            basicPrice *
            overtimeHours *
            coefficient_service *
            coefficientOvertime;
          totalCost += normalCost + overtimeCost;
        }

        currentDate = currentDate.add(1, "day");
      }
    } else {
      // Đơn ngắn hạn
      const dayOfWeek = dayjs(workDate).day();
      const dailyHours = end.diff(start, "hour");

      if (dayOfWeek === 0 || dayOfWeek === 6) {
        let normalHours = 0;
        let overtimeHours = 0;

        if (start.isBefore(officeStartTime)) {
          overtimeHours += officeStartTime.diff(start, "hour");
        }
        if (end.isAfter(officeEndTime)) {
          overtimeHours += end.diff(officeEndTime, "hour");
        }
        normalHours = dailyHours - overtimeHours;

        const weekendCost = basicPrice * normalHours * coefficient_service * coefficientWeekend;
        const overtimeCost =
          basicPrice *
          overtimeHours *
          coefficient_service *
          coefficientWeekend *
          coefficientOvertime;
        totalCost = weekendCost + overtimeCost;
      } else {
        // Ngày trong tuần
        let normalHours = 0;
        let overtimeHours = 0;

        if (start.isBefore(officeStartTime)) {
          overtimeHours += officeStartTime.diff(start, "hour");
        }
        if (end.isAfter(officeEndTime)) {
          overtimeHours += end.diff(officeEndTime, "hour");
        }
        normalHours = dailyHours - overtimeHours;

        const normalCost = basicPrice * normalHours * coefficient_service;
        const overtimeCost =
          basicPrice *
          overtimeHours *
          coefficient_service *
          coefficientOvertime;
        totalCost = normalCost + overtimeCost;
      }
    }

    return Math.floor(totalCost);
  };
  //HANDLE SET COEFFICIENT AUTOMATICALLY
  //convert time to minutes
  const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };
  //check coefficient automatically return value coefficient
  const checkCoefficient = (orderDate, startTime, endTime, timeList) => {
    //when using dayjs libraries, we have 7 days, 0 is sunday and 6 is saturday
    const saturday = 6;
    const sunday = 0;

    if (!orderDate || !startTime || !endTime || !timeList) return "0";

    const orderDay = orderDate.day();
    console.log("orderDayyyyyyyyyyyyyyy", orderDay);
    const orderStartMinutes = timeToMinutes(startTime.format("HH:mm"));
    const orderEndMinutes = timeToMinutes(endTime.format("HH:mm"));

    const officeStartMinutes = timeToMinutes(timeList.officeStartTime);
    const officeEndMinutes = timeToMinutes(timeList.officeEndTime);
    const dayStartMinutes = timeToMinutes(timeList.openHour);
    const dayEndMinutes = timeToMinutes(timeList.closeHour);

    const coefficientWeekend = dataFetch.coefficientOtherList[1].value;
    const coefficientOutside = dataFetch.coefficientOtherList[0].value;
    const coefficientNormal = "0";

    if (orderDay === saturday || orderDay === sunday) {
      return coefficientWeekend;
    }

    if (Array.isArray(orderDate)) {
      const startDate = orderDate[0];
      const endDate = orderDate[1];
      
      // Kiểm tra xem có ngày nào trong khoảng là cuối tuần không
      let currentDate = startDate;
      while (currentDate.isSameOrBefore(endDate)) {
        const currentDay = currentDate.day();
        if (currentDay === saturday || currentDay === sunday) {
          return coefficientWeekend;
        }
        currentDate = currentDate.add(1, 'day');
      }
  
      // Nếu không có ngày cuối tuần, kiểm tra giờ làm việc
      if (
        (orderStartMinutes >= dayStartMinutes &&
          orderStartMinutes < officeStartMinutes) ||
        (orderEndMinutes > officeEndMinutes && orderEndMinutes <= dayEndMinutes)
      ) {
        return coefficientOutside;
      }
  
      return coefficientNormal;
    }

    
    // Nếu không có ngày cuối tuần, kiểm tra giờ làm việc
    if (
      (orderStartMinutes >= dayStartMinutes &&
        orderStartMinutes < officeStartMinutes) ||
      (orderEndMinutes > officeEndMinutes && orderEndMinutes <= dayEndMinutes)
    ) {
      return coefficientOutside; // Outside office hours coefficient
    }

    return coefficientNormal; // Default to normal coefficient
  };

  //update coefficient into form
  const updateCoefficient = () => {
    const workDate = form.getFieldValue("workDate");
    const startTime = form.getFieldValue("startTime");
    const endTime = form.getFieldValue("endTime");

    if (workDate && startTime && endTime && dataFetch.timeList) {
      const newCoefficient = checkCoefficient(
        dayjs(workDate),
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
  const locationsData = [
    {
      value: "ho-chi-minh",
      label: "Thành phố Hồ Chí Minh",
      children: [
        {
          value: "quan-1",
          label: "Quận 1",
          children: [
            { value: "phuong-ben-nghe", label: "Phường Bến Nghé" },
            { value: "phuong-ben-thanh", label: "Phường Bến Thành" },
            { value: "phuong-da-kao", label: "Phường Đa Kao" },
          ],
        },
        {
          value: "quan-2",
          label: "Quận 2",
          children: [
            { value: "phuong-thao-dien", label: "Phường Thảo Điền" },
            { value: "phuong-an-phu", label: "Phường An Phú" },
            { value: "phuong-binh-an", label: "Phường Bình An" },
          ],
        },
      ],
    },
    {
      value: "ha-noi",
      label: "Hà Nội",
      children: [
        {
          value: "quan-hoan-kiem",
          label: "Quận Hoàn Kiếm",
          children: [
            { value: "phuong-hang-bac", label: "Phường Hàng Bạc" },
            { value: "phuong-hang-bo", label: "Phường Hàng Bồ" },
            { value: "phuong-cua-dong", label: "Phường Cửa Đông" },
          ],
        },
        {
          value: "quan-ba-dinh",
          label: "Quận Ba Đình",
          children: [
            { value: "phuong-truc-bach", label: "Phường Trúc Bạch" },
            { value: "phuong-vinh-phuc", label: "Phường Vĩnh Phúc" },
            { value: "phuong-cong-vi", label: "Phường Cống Vị" },
          ],
        },
      ],
    },
    {
      value: "da-nang",
      label: "Đà Nẵng",
      children: [
        {
          value: "quan-hai-chau",
          label: "Quận Hải Châu",
          children: [
            { value: "phuong-thanh-binh", label: "Phường Thanh Bình" },
            { value: "phuong-thuan-phuoc", label: "Phường Thuận Phước" },
            { value: "phuong-hoa-thuan-dong", label: "Phường Hòa Thuận Đông" },
          ],
        },
        {
          value: "quan-son-tra",
          label: "Quận Sơn Trà",
          children: [
            { value: "phuong-man-thai", label: "Phường Mân Thái" },
            { value: "phuong-phuoc-my", label: "Phường Phước Mỹ" },
            { value: "phuong-an-hai-bac", label: "Phường An Hải Bắc" },
          ],
        },
      ],
    },
  ];
  useEffect(() => {
    // fetchLocations();
    setLocations(locationsData);
  }, []);

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
    };

    // Send data to backend
    console.log("dttaforbe", dataForBackend)
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
          navigate("/order");
          setShowNotification(null);
        }, 1500);
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
              label="Số Điện Thoại KH"
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
              label="Họ và Tên KH"
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
              label="Địa Chỉ Khách Hàng"
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
              label="Loại Dịch Vụ"
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
            <Form.Item name="requestType" label="Loại Yêu Cầu">
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
                  ? "Ngày Làm Việc"
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
                <DatePicker onChange={handleDateChange} />
              ) : (
                <DatePicker.RangePicker onChange={handleDateChange} />
              )}
            </Form.Item>
          </Col>
        </Row>

        <Row>
          <Col span={3}>
            <Form.Item
              name="startTime"
              label="Giờ Bắt Đầu"
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
          <Col span={3}>
            <Form.Item
              name="endTime"
              label="Giờ Kết Thúc"
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
              rules={[{ required: true, message: "Vui lòng chọn hệ số phụ!" }]}
            >
              <Input disabled value={coefficient} />
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
