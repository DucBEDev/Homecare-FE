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
  const [appliedCoefficient, setAppliedCoefficient] = useState("0");
  const [requestType, setRequestType] = useState("short");
  const [timeErrors, setTimeErrors] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [totalCost, setTotalCost] = useState(0);

  // Fetch dữ liệu đơn hàng cụ thể
  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}admin/requests/edit/${orderId}`
        );
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
            .join(","),
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
          coefficientOther: orderData.request.service.coefficient_other,
        });

        setRequestType(
          orderData.request.requestType === "Dài hạn" ? "long" : "short"
        );
        setAppliedCoefficient(orderData.request.service.coefficient_other);
        setTotalCost(orderData.request.totalCost);
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
          `${process.env.REACT_APP_API_URL}admin/requests/create` // Assuming this endpoint provides locations data
        );
        setDataFetch(response.data);

        if (response.data?.locations) {
          const formattedLocations = response.data.locations.map(
            (province) => ({
              value: province.Name,
              label: province.Name,
              children: (province.Districts || []).map((district) => ({
                value: district.Name,
                label: district.Name,
                children: (district.Wards || []).map((ward) => ({
                  value: ward.Name,
                  label: ward.Name,
                })),
              })),
            })
          );
          setLocations(formattedLocations);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  //TOTAL COST
  const updateTotalCost = () => {
    const newTotalCost = calculateTotalCost();
    setTotalCost(newTotalCost);
  };

  const calculateTotalCost = () => {
    const formValues = form.getFieldsValue();
    const {
      serviceTitle,
      startTime,
      endTime,
      workDate,
      coefficientOther,
      requestType,
    } = formValues;

    if (
      !serviceTitle ||
      !startTime ||
      !endTime ||
      !workDate ||
      !coefficientOther
    ) {
      return 0;
    }

    const selectedService = dataFetch.serviceList?.find(
      (service) => service.title === serviceTitle
    );

    if (!selectedService) {
      return 0;
    }

    const { basicPrice, coefficient: coefficientService } = selectedService;
    const coefficientWeekend = parseFloat(
      dataFetch.coefficientOtherList?.[1]?.value || 1
    );
    const coefficientOvertime = parseFloat(
      dataFetch.coefficientOtherList?.[0]?.value || 1
    );

    const start = dayjs(startTime);
    const end = dayjs(endTime);

    const officeStartTime = dayjs(dataFetch.timeList?.officeStartTime, "HH:mm");
    const officeEndTime = dayjs(dataFetch.timeList?.officeEndTime, "HH:mm");

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
        let dailyHours = end.diff(start, "hour");
        // Handle cases where endTime is earlier than startTime (working overnight)
        if (dailyHours < 0) {
          dailyHours += 24;
        }

        let normalHours = 0;
        let overtimeHours = 0;

        if (start.isBefore(officeStartTime) && end.isAfter(officeStartTime)) {
          overtimeHours += officeStartTime.diff(start, "hour");
        }

        if (end.isAfter(officeEndTime) && start.isBefore(officeEndTime)) {
          overtimeHours += end.diff(officeEndTime, "hour");
        }

        // Handle cases where work time spans across office hours
        if (
          start.isBefore(officeStartTime) &&
          end.isBefore(officeStartTime) &&
          end.isAfter(start)
        ) {
          overtimeHours += end.diff(start, "hour");
        }
        if (
          start.isAfter(officeEndTime) &&
          end.isAfter(officeEndTime) &&
          end.isAfter(start)
        ) {
          overtimeHours += end.diff(start, "hour");
        }

        normalHours = Math.max(0, dailyHours - overtimeHours);

        if (dayOfWeek === 0 || dayOfWeek === 6) {
          const weekendCost =
            basicPrice * normalHours * coefficientService * coefficientWeekend;
          const overtimeCost =
            basicPrice *
            overtimeHours *
            coefficientService *
            coefficientWeekend *
            coefficientOvertime;
          totalCost += weekendCost + overtimeCost;
        } else {
          const normalCost = basicPrice * normalHours * coefficientService;
          const overtimeCost =
            basicPrice *
            overtimeHours *
            coefficientService *
            coefficientOvertime;
          totalCost += normalCost + overtimeCost;
        }

        currentDate = currentDate.add(1, "day");
      }
    } else {
      const dayOfWeek = dayjs(workDate).day();
      let dailyHours = end.diff(start, "hour");
      // Handle cases where endTime is earlier than startTime (working overnight)
      if (dailyHours < 0) {
        dailyHours += 24;
      }

      let normalHours = 0;
      let overtimeHours = 0;

      if (start.isBefore(officeStartTime) && end.isAfter(officeStartTime)) {
        overtimeHours += officeStartTime.diff(start, "hour");
      }

      if (end.isAfter(officeEndTime) && start.isBefore(officeEndTime)) {
        overtimeHours += end.diff(officeEndTime, "hour");
      }

      // Handle cases where work time spans across office hours
      if (
        start.isBefore(officeStartTime) &&
        end.isBefore(officeStartTime) &&
        end.isAfter(start)
      ) {
        overtimeHours += end.diff(start, "hour");
      }
      if (
        start.isAfter(officeEndTime) &&
        end.isAfter(officeEndTime) &&
        end.isAfter(start)
      ) {
        overtimeHours += end.diff(start, "hour");
      }

      normalHours = Math.max(0, dailyHours - overtimeHours);

      if (dayOfWeek === 0 || dayOfWeek === 6) {
        const weekendCost =
          basicPrice * normalHours * coefficientService * coefficientWeekend;
        const overtimeCost =
          basicPrice *
          overtimeHours *
          coefficientService *
          coefficientWeekend *
          coefficientOvertime;
        totalCost = weekendCost + overtimeCost;
      } else {
        const normalCost = basicPrice * normalHours * coefficientService;
        const overtimeCost =
          basicPrice * overtimeHours * coefficientService * coefficientOvertime;
        totalCost = normalCost + overtimeCost;
      }
    }

    return Math.floor(totalCost);
  };

  const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const checkCoefficient = (orderDate, startTime, endTime, timeList) => {
    const saturday = 6;
    const sunday = 0;

    if (!orderDate || !startTime || !endTime || !timeList) return "0";

    const coefficientWeekend =
      dataFetch.coefficientOtherList?.[1]?.value || "1";
    const coefficientOutside =
      dataFetch.coefficientOtherList?.[0]?.value || "1";
    const coefficientNormal = "1";

    if (Array.isArray(orderDate)) {
      const startDate = orderDate[0];
      const endDate = orderDate[1];

      for (
        let currentDate = startDate;
        currentDate.isSameOrBefore(endDate);
        currentDate = currentDate.add(1, "day")
      ) {
        const currentDay = currentDate.day();
        if (currentDay === saturday || currentDay === sunday) {
          return coefficientWeekend;
        }
      }
    } else {
      const orderDay = orderDate.day();
      if (orderDay === saturday || orderDay === sunday) {
        return coefficientWeekend;
      }
    }

    const orderStartMinutes = timeToMinutes(startTime.format("HH:mm"));
    const orderEndMinutes = timeToMinutes(endTime.format("HH:mm"));
    const officeStartMinutes = timeToMinutes(timeList.officeStartTime);
    const officeEndMinutes = timeToMinutes(timeList.officeEndTime);
    const dayStartMinutes = timeToMinutes(timeList.openHour);
    const dayEndMinutes = timeToMinutes(timeList.closeHour);

    if (
      (orderStartMinutes >= dayStartMinutes &&
        orderStartMinutes < officeStartMinutes) ||
      orderStartMinutes === dayStartMinutes ||
      (orderEndMinutes > officeEndMinutes &&
        orderEndMinutes <= dayEndMinutes) ||
      orderEndMinutes === dayEndMinutes
    ) {
      return coefficientOutside;
    }

    return coefficientNormal;
  };

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
      setAppliedCoefficient(newCoefficient);
      form.setFieldsValue({ coefficientOther: newCoefficient });
    }
  };

  const handleDateChange = (date) => {
    form.setFieldsValue({ workDate: date });
    updateCoefficient();
    updateTotalCost();
  };

  const disabledHours = () => {
    if (!dataFetch.timeList) {
      return [];
    }
    const openHour = parseInt(dataFetch.timeList.openHour.split(":")[0], 10);
    const closeHour = parseInt(dataFetch.timeList.closeHour.split(":")[0], 10);
    const hours = [];
    for (let i = 0; i < 24; i++) {
      if (i < openHour || i > closeHour) {
        hours.push(i);
      }
    }
    return hours;
  };

  const disabledMinutes = (selectedHour) => {
    if (!dataFetch.timeList) {
      return [];
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

  const isValidTimeRange = (startTime, endTime) => {
    if (!startTime || !endTime) return false;

    const start = dayjs(startTime);
    const end = dayjs(endTime);

    const diffInHours = end.diff(start, "hour", true);

    // Handle cases where endTime is earlier than startTime (working overnight)
    if (diffInHours < 0) {
      return diffInHours + 24 >= 2 && (diffInHours + 24) % 1 === 0;
    }

    return diffInHours >= 2 && diffInHours % 1 === 0;
  };

  const handleTimeChange = (field, time) => {
    form.setFieldsValue({ [field]: time });

    updateCoefficient();
    updateTotalCost();

    const startTime =
      field === "startTime" ? time : form.getFieldValue("startTime");
    const endTime = field === "endTime" ? time : form.getFieldValue("endTime");

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
    return current && current < dayjs().startOf("day");
  };

  const validatePhoneNumber = (_, value) => {
    if (!value) {
      return Promise.resolve();
    }
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    if (!phoneRegex.test(value)) {
      return Promise.reject("Số điện thoại không hợp lệ!");
    }
    return Promise.resolve();
  };

  const handleRequestType = (value) => {
    setRequestType(value.target.value);
    updateTotalCost();
  };

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

    const dataForBackend = {
      ...otherValues,
      startTime: values.startTime?.format("HH:mm"),
      endTime: values.endTime?.format("HH:mm"),
      requestType: requestType === "short" ? "Ngắn hạn" : "Dài hạn",
      serviceBasePrice: dataFetch?.serviceList?.find(
        (item) => item.title === values.serviceTitle
      )?.basicPrice,
      coefficientService: dataFetch?.serviceList?.find(
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
      coefficientOther: values.coefficientOther,
      serviceTitle: values.serviceTitle,
      totalCost: totalCost,
    };

    try {
      const response = await axios.patch(
        `${process.env.REACT_APP_API_URL}admin/requests/edit/${orderId}`,
        dataForBackend
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
        }, 1500);
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

  // Check if dataFetch is loaded before rendering
  if (!dataFetch || !dataFetch.locations) {
    return <div>Loading...</div>; // Or a more sophisticated loading indicator
  }

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
              <Input id="phone" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="fullName"
              label="Họ và Tên KH"
              rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
            >
              <Input id="fullName" />
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
              <Input id="address" />
            </Form.Item>
          </Col>
          <Col span={8} className="location-custom">
            <Form.Item
              name="location"
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
              <Radio.Group className="service-radio-group">
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
              name="coefficientOther"
              label="Hệ số"
              rules={[{ required: true, message: "Vui lòng chọn hệ số phụ!" }]}
            >
              <Input disabled value={appliedCoefficient} />
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
