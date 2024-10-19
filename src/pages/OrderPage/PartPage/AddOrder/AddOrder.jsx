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
import "../../StylePage/styleAdd.css";

const { Option } = Select;

const AddOrder = () => {
  const [requestType, setRequestType] = useState("short");
  const [selectedDistrict, setSelectedDistrict] = useState("q1");
  const [cityData, setCityData] = useState([]);

  const [form] = Form.useForm();

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

  const handleDistrictChange = (value) => {
    console.log(value);
    setSelectedDistrict(value);
  };

  const onFinish = (values) => {
    console.log("Received values:", values);
    // Xử lý gửi dữ liệu đơn hàng ở đây

    // Prepare data for backend
    const dataForBackend = {
      ...values,
      // Add any additional data needed for the backend here, e.g.,
      // userId: getCurrentUserId(),
    };

    // Send data to backend
    fetch("/your-backend-api-endpoint", {
      // Replace with your actual endpoint
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataForBackend),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Response from backend:", data);
        // Handle successful response, e.g., show a success message, redirect, etc.
        message.success("Order created successfully!"); // Assuming you are using Ant Design's message API
      })
      .catch((error) => {
        console.error("Error sending data to backend:", error);
        // Handle error, e.g., show an error message
        message.error("Failed to create order.");
      });
  };

  const handleRequestType = (value) => {
    if (value === "short") {
      setRequestType("short");
    } else {
      setRequestType("long");
    }
  };

  useEffect(() => {
    // Fetch city data (replace with your actual API endpoint)
    fetch("/api/cities") // Example endpoint
      .then((response) => response.json())
      .then((data) => setCityData(data))
      .catch((error) => console.error("Error fetching city data:", error));
  }, []);

  const renderWorkDate = () => {
    if (requestType === "short") {
      return (
        <>
          <Row>
            <Col>
              <Form.Item
                name="workDate"
                label="Ngày Làm Việc"
                rules={[
                  { required: true, message: "Vui lòng chọn ngày làm việc!" },
                ]}
              ></Form.Item>
            </Col>

            <Col>
              <DatePicker style={{ marginTop: "-10px" }} />
            </Col>
          </Row>
        </>
      );
    } else {
      console.log("ccc");
      return (
        <>
          <Row>
            <Col>
              <Form.Item
                name="workDate"
                label="Ngày Làm Việc"
                rules={[
                  { required: true, message: "Vui lòng chọn ngày làm việc!" },
                ]}
              ></Form.Item>
            </Col>

            <Col style={{ marginTop: "-2px" }}>
              <span
                style={{
                  margin: "0 20px 0 30px",
                  fontSize: "12px",
                  fontWeight: "500",
                }}
              >
                Từ
              </span>
              <DatePicker style={{ marginTop: "-10px" }} />
              <span style={{ margin: "0 30px", fontSize: "12px" }}>đến</span>
              <DatePicker style={{ marginTop: "-10px" }} />
            </Col>
          </Row>
        </>
      );
    }
  };

  return (
    <Card className="card" title="Thông tin đơn hàng">
      <Form form={form} layout="vertical" onFinish={onFinish}>
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

        <Form.Item
          name="name"
          label="Họ và Tên KH"
          rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="address"
          label="Địa Chỉ Khách Hàng"
          rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="location" // Name for the location data in form values
          label="Địa điểm"
          rules={[{ required: true, message: "Vui lòng chọn địa điểm!" }]}
        >
          <Cascader
            options={cityData}
            placeholder="Chọn Tỉnh/Thành phố, Quận, Phường"
            fieldNames={{ label: "name", value: "code", children: "districts" }} // Adjust as needed
            onChange={(value, selectedOptions) => {
              console.log("Selected location:", value);
              console.log("Selected options:", selectedOptions);
            }}
            className="cascader-custom"
          />
        </Form.Item>

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
        {renderWorkDate()}

        <Row gutter={16}>
          <Col span={5}>
            <Form.Item
              name="startTime"
              label="Giờ Bắt Đầu"
              rules={[
                { required: true, message: "Vui lòng chọn giờ bắt đầu!" },
              ]}
            >
              <TimePicker format="HH:mm" hourStep={1} minuteStep={30} />
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
              <TimePicker format="HH:mm" hourStep={1} minuteStep={30} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Tạo Yêu Cầu
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default AddOrder;
