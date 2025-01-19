import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  DatePicker,
  Select,
  InputNumber,
  Upload,
  message,
  Row,
  Col,
  Typography,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";
import "../../StylePage/AddMaid.css";

const { Option } = Select;
const { Title } = Typography;

const AddMaid = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);

  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("Bạn chỉ có thể tải lên file JPG/PNG!");
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Ảnh phải nhỏ hơn 2MB!");
    }
    return isJpgOrPng && isLt2M;
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const formData = new FormData();

      // Append text fields
      for (const key in values) {
        if (key === "ngaysinh") {
          formData.append(key, values[key].format("YYYY-MM-DD"));
        } else if (key !== "hinhAnh") {
          formData.append(key, values[key]);
        }
      }

      // Append images
      if (fileList && fileList.length > 0) {
        fileList.forEach((file) => {
          formData.append("hinhAnh", file.originFileObj);
        });
      }

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}admin/maid/create`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 201) {
        message.success("Thêm người giúp việc thành công");
        form.resetFields();
        setFileList([]);
      } else {
        message.error("Thêm người giúp việc thất bại");
      }
    } catch (error) {
      console.error("Error adding maid:", error);
      message.error("Lỗi khi thêm người giúp việc: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTagChange = (value) => {
    form.setFieldsValue({ loaiCongViec: value });
  };
  return (
    <div className="add-maid-wrapper" style={{ margin: "90px 0 0 20px" }}>
      <div className="header-container">
        <div className="green-header">
          <span className="header-title">Thêm người giúp việc</span>
        </div>
      </div>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        className="add-maid-form"
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="hoTen"
              label="Họ và tên"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập họ và tên",
                },
              ]}
            >
              <Input placeholder="Nhập họ và tên" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="cmnd"
              label="CMND/CCCD"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập CMND/CCCD",
                },
              ]}
            >
              <Input placeholder="Nhập CMND/CCCD" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="ngaysinh"
              label="Ngày sinh"
              className="ant-date-dateBirth"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn ngày sinh",
                },
              ]}
            >
              <DatePicker
                style={{ width: "100%" }}
                format="DD-MM-YYYY"
                placeholder="Chọn ngày sinh"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="gioiTinh"
              label="Giới tính"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn giới tính",
                },
              ]}
            >
              <Select placeholder="Chọn giới tính">
                <Option value="Nam">Nam</Option>
                <Option value="Nữ">Nữ</Option>
                <Option value="Khác">Khác</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="danToc"
              label="Dân tộc"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập dân tộc",
                },
              ]}
            >
              <Input placeholder="Nhập dân tộc" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="trinhDoHocVan"
              label="Trình độ học vấn"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập trình độ học vấn",
                },
              ]}
            >
              <Input placeholder="Nhập trình độ học vấn" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="chieuCao"
              label="Chiều cao (cm)"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập chiều cao",
                },
              ]}
            >
              <InputNumber
                min={0}
                style={{
                  width: "100%",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  fontSize: "22px",
                }}
                placeholder="Nhập chiều cao"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="canNang"
              label="Cân nặng (kg)"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập cân nặng",
                },
              ]}
            >
              <InputNumber
                min={0}
                style={{
                  width: "100%",
                  height: "32px",
                  display: "flex",
                  fontSize: "22px",
                  alignItems: "center",
                }}
                placeholder="Nhập cân nặng"
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="sdt"
              label="Số điện thoại"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập số điện thoại",
                },
              ]}
            >
              <Input placeholder="Nhập số điện thoại" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="queQuan"
              label="Quê quán"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập quê quán",
                },
              ]}
            >
              <Input placeholder="Nhập quê quán" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="diaChiThuongTru"
              label="Địa chỉ thường trú"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập địa chỉ thường trú",
                },
              ]}
            >
              <Input placeholder="Nhập địa chỉ thường trú" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="khuVucLamViec"
              label="Khu vực làm việc"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập khu vực làm việc",
                },
              ]}
            >
              <Input placeholder="Nhập khu vực làm việc" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="soNamKinhNghiem"
              label="Số năm kinh nghiệm"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập số năm kinh nghiệm",
                },
              ]}
            >
              <InputNumber
                min={0}
                style={{
                  width: "100%",
                  height: "32px",
                  display: "flex",
                  fontSize: "22px",
                  alignItems: "center",
                }}
                placeholder="Nhập số năm kinh nghiệm"
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="workingDays" label="Ngày làm việc trong tuần">
              <Select
                mode="multiple"
                placeholder="Chọn ngày"
                optionLabelProp="label"
                className="system-page-select"
              >
                <Option value="Monday" label="Thứ 2">
                  Thứ 2
                </Option>
                <Option value="Tuesday" label="Thứ 3">
                  Thứ 3
                </Option>
                <Option value="Wednesday" label="Thứ 4">
                  Thứ 4
                </Option>
                <Option value="Thursday" label="Thứ 5">
                  Thứ 5
                </Option>
                <Option value="Friday" label="Thứ 6">
                  Thứ 6
                </Option>
                <Option value="Saturday" label="Thứ 7">
                  Thứ 7
                </Option>
                <Option value="Sunday" label="Chủ Nhật">
                  Chủ Nhật
                </Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="trangThai"
              label="Trạng thái"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn trạng thái",
                },
              ]}
            >
              <Select placeholder="Chọn trạng thái">
                <Option value="hoat_dong">Hoạt động</Option>
                <Option value="dung_hoat_dong">Dừng hoạt động</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="moTaKinhNghiem" label="Mô tả kinh nghiệm">
              <Input.TextArea rows={4} placeholder="Nhập mô tả kinh nghiệm" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="heSo"
              label="Hệ số"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập hệ số",
                },
              ]}
            >
              <InputNumber
                min={0}
                step={0.1}
                style={{
                  width: "100%",
                  height: "32px",
                  display: "flex",
                  fontSize: "22px",
                  alignItems: "center",
                }}
                placeholder="Nhập hệ số"
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name="hinhAnh" label="Hình ảnh">
              <Upload
                fileList={fileList}
                onChange={handleUploadChange}
                beforeUpload={beforeUpload}
                listType="picture"
                maxCount={1}
                multiple={true}
              >
                <Button icon={<UploadOutlined style={{ fontSize: "16px" }} />}>
                  Chọn ảnh
                </Button>
              </Upload>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name="giayKhamSucKhoe" label="Giấy khám sức khoẻ">
              <Upload
                fileList={fileList}
                onChange={handleUploadChange}
                beforeUpload={beforeUpload}
                listType="picture"
                maxCount={1}
                multiple={true}
              >
                <Button icon={<UploadOutlined style={{ fontSize: "16px" }} />}>
                  Chọn file
                </Button>
              </Upload>
            </Form.Item>
          </Col>
        </Row>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="add-maid-button"
          >
            Thêm người giúp việc
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AddMaid;
