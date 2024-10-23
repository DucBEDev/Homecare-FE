import React, { useEffect, useState } from "react";
import {
  Card,
  Form,
  Input,
  Select,
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
import DatePickerComponent from "../../../../components/DatePickerComponent/DatePickerComponent";
import "../../StylePage/styleAdd.css";
import axios from "axios";

// const { Option } = Select;

const AddOrder = () => {
  const [locations, setLocations] = useState([]);

  const [requestType, setRequestType] = useState("short");
  const [form] = Form.useForm();
  const [timeErrors, setTimeErrors] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);
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
    if (value === "short") {
      setRequestType("short");
    } else {
      setRequestType("long");
    }
  };

  // const fetchLocations = async () => {
  //   try {
  //     const response = await axios.get(
  //       `${process.env.REACT_APP_API_URL}/admin/locations`
  //     );
  //     console.log("response lo");
  //     console.log({ response });
  //     setLocations(response.data.records);
  //   } catch (error) {
  //     console.error("Error fetching locations:", error);
  //     message.error("Không thể tải dữ liệu địa điểm");
  //   }
  // };
  const locationsData = [
    {
      value: 'ho-chi-minh',
      label: 'Thành phố Hồ Chí Minh',
      children: [
        {
          value: 'quan-1',
          label: 'Quận 1',
          children: [
            { value: 'phuong-ben-nghe', label: 'Phường Bến Nghé' },
            { value: 'phuong-ben-thanh', label: 'Phường Bến Thành' },
            { value: 'phuong-da-kao', label: 'Phường Đa Kao' },
          ],
        },
        {
          value: 'quan-2',
          label: 'Quận 2',
          children: [
            { value: 'phuong-thao-dien', label: 'Phường Thảo Điền' },
            { value: 'phuong-an-phu', label: 'Phường An Phú' },
            { value: 'phuong-binh-an', label: 'Phường Bình An' },
          ],
        },
      ],
    },
    {
      value: 'ha-noi',
      label: 'Hà Nội',
      children: [
        {
          value: 'quan-hoan-kiem',
          label: 'Quận Hoàn Kiếm',
          children: [
            { value: 'phuong-hang-bac', label: 'Phường Hàng Bạc' },
            { value: 'phuong-hang-bo', label: 'Phường Hàng Bồ' },
            { value: 'phuong-cua-dong', label: 'Phường Cửa Đông' },
          ],
        },
        {
          value: 'quan-ba-dinh',
          label: 'Quận Ba Đình',
          children: [
            { value: 'phuong-truc-bach', label: 'Phường Trúc Bạch' },
            { value: 'phuong-vinh-phuc', label: 'Phường Vĩnh Phúc' },
            { value: 'phuong-cong-vi', label: 'Phường Cống Vị' },
          ],
        },
      ],
    },
    {
      value: 'da-nang',
      label: 'Đà Nẵng',
      children: [
        {
          value: 'quan-hai-chau',
          label: 'Quận Hải Châu',
          children: [
            { value: 'phuong-thanh-binh', label: 'Phường Thanh Bình' },
            { value: 'phuong-thuan-phuoc', label: 'Phường Thuận Phước' },
            { value: 'phuong-hoa-thuan-dong', label: 'Phường Hòa Thuận Đông' },
          ],
        },
        {
          value: 'quan-son-tra',
          label: 'Quận Sơn Trà',
          children: [
            { value: 'phuong-man-thai', label: 'Phường Mân Thái' },
            { value: 'phuong-phuoc-my', label: 'Phường Phước Mỹ' },
            { value: 'phuong-an-hai-bac', label: 'Phường An Hải Bắc' },
          ],
        },
      ],
    },
  ];

  useEffect(() => {
    // fetchLocations();
    setLocations(locationsData);
  }, []);

  const renderWorkDate = () => {
    if (requestType === "short") {
      return (
        <>
          <Form.Item
            name="workDate"
            label="Ngày Làm Việc"
            rules={[
              { required: true, message: "Vui lòng chọn ngày làm việc!" },
            ]}
          >
            <DatePicker />
          </Form.Item>
        </>
      );
    } else {
      console.log("ccc");
      return (
        <>
          <Form.Item
            name="workDate"
            label="Ngày Làm Việc"
            rules={[
              { required: true, message: "Vui lòng chọn ngày làm việc!" },
            ]}
          >
            {/* <span
              style={{
                fontSize: "12px",
                fontWeight: "500",
                marginRight: "6px",
              }}
            >
              Từ
            </span>
            <DatePicker />
            <span style={{ margin: "0 10px", fontSize: "12px" }}>đến</span>
            <DatePicker /> */}
            <span style={{ margin: "0 10px", fontSize: "12px" }}></span>
            <DatePickerComponent />
          </Form.Item>
        </>
      );
    }
  };

  const onFinish = (values) => {
    console.log("Received values:", values);

    // Prepare data for backend
    const dataForBackend = {
      ...values,
      startTime: values.startTime?.format("HH:mm"),
      endTime: values.endTime?.format("HH:mm"),
      workDate:
        requestType === "short"
          ? values.workDate?.format("YYYY-MM-DD")
          : {
              from: values.workDate?.[0]?.format("YYYY-MM-DD"),
              to: values.workDate?.[1]?.format("YYYY-MM-DD"),
            },
      location: values.location?.join(", "), // Convert array to string
    };

    // Send data to backend
    axios.post(`${process.env.REACT_APP_API_URL}/admin/requests/create`, dataForBackend, {
      headers: {
        "Content-Type": "application/json",
        },
      })
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
      <Form form={form} layout="vertical" onFinish={onFinish}>
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
              name="name"
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
          <Col span={8}>
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
                // fieldNames={{
                //   label: "name",
                //   value: "code",
                //   children: "districts",
                // }} // Adjust as needed
                // onChange={(value, selectedOptions) => {
                //   console.log("Selected location:", value);
                //   console.log("Selected options:", selectedOptions);
                // }}
                className="cascader-custom"
              />
            </Form.Item>
          </Col>
          {/* <Col span={8}>
            <Form.Item
              name="district"
              label="Quận"
              rules={[{ required: true, message: "Vui lòng chọn quận!" }]}
            >
              <Select value={selectedDistrict} onChange={handleDistrictChange}>
                <Option value="q1">Quận 1</Option>
                <Option value="q2">Quận 2</Option>
                <Option value="q3">Quận 3</Option>
                <Option value="q4">Quận 4</Option>
                <Option value="q5">Quận 5</Option>
                <Option value="q6">Quận 6</Option>
                <Option value="q7">Quận 7</Option>
                <Option value="q8">Quận 8</Option>
                <Option value="q9">Quận 9</Option>
                <Option value="q10">Quận 10</Option>
                <Option value="q11">Quận 11</Option>
                <Option value="q12">Quận 12</Option>
                <Option value="tanphu">Quận Tân Phú</Option>
                <Option value="tanbinh">Quận Tân Bình</Option>
                <Option value="binhtan">Quận Bình Tân</Option>
                <Option value="binhthanh">Quận Bình Thạnh</Option>
                <Option value="govap">Quận Gò Vấp</Option>
                <Option value="hocmon">Quận Hóc Môn</Option>
              </Select>
            </Form.Item>
          </Col> */}
        </Row>
        <Row>
          <Col span={7}>
            <Form.Item
              name="services"
              label="Loại Dịch Vụ"
              rules={[{ required: true, message: "Vui lòng chọn dịch vụ!" }]}
            >
              <Radio.Group style={{ marginTop: "-30000px" }}>
                <Radio value="osin">Osin part time</Radio>
                <Radio value="cleaning">Dọn dẹp</Radio>
                <Radio value="cooking">Nấu ăn</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col span={5}>
            <Form.Item name="requestType" label="Loại Yêu Cầu">
              <Radio.Group onChange={(e) => console.log(e)}>
                <Radio value="short" onClick={() => handleRequestType("short")}>
                  Ngắn hạn
                </Radio>
                <Radio value="long" onClick={() => handleRequestType("long")}>
                  Dài hạn
                </Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col span={12} style={{ marginTop: "0px" }}>
            {renderWorkDate()}
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={5}>
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
              />
            </Form.Item>
          </Col>
          <Col span={19}>
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
