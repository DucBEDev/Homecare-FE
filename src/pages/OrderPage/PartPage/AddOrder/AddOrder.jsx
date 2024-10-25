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
  message,
  Cascader,
} from "antd";
import { Table } from "antd";
import dayjs from "dayjs";
import "../../StylePage/styleAdd.css";
import axios from "axios";

// const { Option } = Select;

const AddOrder = () => {
  const [locations, setLocations] = useState([]);
  const [coefficient, setCoefficient] = useState([]);

  const [requestType, setRequestType] = useState("short");
  const [form] = Form.useForm();
  const [timeErrors, setTimeErrors] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);
  const [dataFetch, setDataFetch] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/admin/requests/create`
        );
        console.log("responsaaaaaaaaaaaaaae", response);
        setDataFetch(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const disabledHours = () => {
    const hours = [];
    for (let i = 0; i < 24; i++) {
      if (i < 8 || i > 20) {
        hours.push(i);
      }
    }
    return hours;
  };

  const disabledMinutes = (selectedHour) => {
    const minutes = [];
    if (selectedHour === 20) {
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

    // Check if the end time is at least 2 hours after the start time
    // and not 30 minutes past the hour
    return diffInHours >= 2 && diffInHours % 1 === 0;
  };
  const handleTimeChange = (field, time) => {
    form.setFieldsValue({ [field]: time });

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

  const columns = [
    {
      title: "Tổng Chi Phí",
      dataIndex: "totalCost",
      key: "totalCost",
      render: (text) => (
        <span style={{ color: "#32d48a", fontWeight: "bold" }}>{text}</span>
      ),
    },
  ];

  const data = [
    {
      key: "1",
      totalCost: "0",
    },
  ];

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
  const handlePhoneChange = (e) => {
    const phoneNumber = e.target.value;
    console.log("Current phone number:", phoneNumber);
  };

  const handleRequestType = (value) => {
    console.log("valueeeeeeeeeeee", value);
    setRequestType(value.target.value);
  };

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

  const coefficientData = [
    {
      value: "1.3",
      label: "Hệ số ngoài giờ",
    },
    {
      value: "1.4",
      label: "Hệ số cuối tuần",
    },
  ];

  useEffect(() => {
    setCoefficient(coefficientData);
  }, []);

  const onFinish = (values) => {
    const {
      startTime,
      endTime,
      location,
      requestType,
      workDate,
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
      coefficient_other: values.coefficient_other?.join(", "),
    };
    console.log("dataForBackend", dataForBackend);

    // Send data to backend
    axios
      .post(
        `${process.env.REACT_APP_API_URL}/admin/requests/create`,
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
        return response.json();
      })
      .then((data) => {
        console.log("Response from backend:", data);
        message.success("Đơn hàng đã được tạo thành công!");
      })
      .catch((error) => {
        console.error("Error sending data to backend:", error);
        message.error("Không thể tạo đơn hàng. Vui lòng thử lại.");
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
              <Input onChange={handlePhoneChange} />
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
              <Radio.Group style={{ marginTop: "-30000px" }}>
                <Radio value="Dọn dẹp">Dọn dẹp</Radio>
                <Radio value="Chăm sóc người già">Chăm sóc người già</Radio>
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
                <DatePicker />
              ) : (
                <DatePicker.RangePicker />
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
              <Cascader
                options={coefficient}
                placeholder="Chọn hệ số phụ"
                showSearch
                changeOnSelect
                allowClear={false}
              />
            </Form.Item>
          </Col>
        </Row>

        {timeErrors && (
          <div style={{ color: "red", marginBottom: "10px" }}>{timeErrors}</div>
        )}

        <Table
          columns={columns}
          dataSource={data}
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
    </Card>
  );
};

export default AddOrder;
