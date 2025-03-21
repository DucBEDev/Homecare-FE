import React, { useState } from "react";
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Row,
  Col,
  Upload,
  message,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import NotificationComponent from "../../../components/NotificationComponent/NotificationComponent";

const { TextArea } = Input;
const { Option } = Select;

const AddBlog = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [showNotification, setShowNotification] = useState(false);

  // Danh sách các loại blog
  const blogTypes = ["Quảng cáo", "Thông báo"];

  // Xử lý upload ảnh
  const handleImageUpload = ({ fileList }) => {
    setFileList(fileList);
    if (fileList.length > 0) {
      const file = fileList[0].originFileObj;
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImageUrl("");
    }
  };

  // Xử lý khi submit form
  const onFinish = async (values) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("description", values.description);
      formData.append("content", values.content);
      formData.append("author", values.author);
      formData.append("type", values.type);
      formData.append("status", values.status);
      if (fileList.length > 0) {
        formData.append("img", fileList[0].originFileObj);
      }

      // Gửi dữ liệu lên server
      const response = await axios
        .post(`${process.env.REACT_APP_API_URL}admin/blogs/create`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((response) => {
          if (!response) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response;
        })
        .then((data) => {
          setShowNotification({
            status: "success",
            message: "Thành công",
            description: "Bài viết đã được tạo thành công!",
          });

          setTimeout(() => {
            navigate("/blog");
            setShowNotification(null);
          }, 600);
        })
        .catch((error) => {
          console.error("Error sending data to backend:", error);
          setShowNotification({
            status: "error",
            message: "Thất bại",
            description: "Không thể tạo bài viết. Vui lòng thử lại.",
          });
        });

      // Thông báo thành công và chuyển hướng
      message.success("Blog post created successfully!");
      navigate("/blogs");
    } catch (error) {
      // Thông báo lỗi nếu có
      message.error("Failed to create blog post. Please try again.");
      console.error("Error creating blog post:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-maid-wrapper" style={{ margin: "90px 0 0 20px" }}>
      <div className="header-container">
        <div className="green-header">
          <span className="header-title">Thêm bài viết</span>
        </div>
      </div>
      <Card className="w-full max-w-4xl mx-auto my-8 p-6 shadow-lg rounded-lg">
        <Form form={form} layout="vertical" onFinish={onFinish}>
          {/* Title */}
          <Form.Item
            name="title"
            label={<span className="font-medium text-gray-700">Title</span>}
            rules={[
              { required: true, message: "Please enter the blog title!" },
            ]}
          >
            <Input
              placeholder="Enter blog title"
              className="w-full rounded-lg px-4 py-2 border-gray-300 hover:border-blue-400 focus:ring-2 focus:ring-blue-200"
            />
          </Form.Item>

          {/* Description */}
          <Form.Item
            name="description"
            label={
              <span className="font-medium text-gray-700">Description</span>
            }
            rules={[{ required: true, message: "Please enter a description!" }]}
          >
            <TextArea
              rows={3}
              placeholder="Enter a brief description"
              className="w-full rounded-lg px-4 py-2 border-gray-300 hover:border-blue-400 focus:ring-2 focus:ring-blue-200"
            />
          </Form.Item>

          {/* Content */}
          <Form.Item
            name="content"
            label={<span className="font-medium text-gray-700">Content</span>}
            rules={[
              { required: true, message: "Please enter the blog content!" },
            ]}
          >
            <TextArea
              rows={6}
              placeholder="Enter blog content"
              className="w-full rounded-lg px-4 py-2 border-gray-300 hover:border-blue-400 focus:ring-2 focus:ring-blue-200"
            />
          </Form.Item>

          {/* Author */}
          <Form.Item
            name="author"
            label={<span className="font-medium text-gray-700">Author</span>}
            rules={[
              { required: true, message: "Please enter the author name!" },
            ]}
          >
            <Input
              placeholder="Enter author name"
              className="w-full rounded-lg px-4 py-2 border-gray-300 hover:border-blue-400 focus:ring-2 focus:ring-blue-200"
            />
          </Form.Item>

          {/* Type & Status */}
          <Row gutter={[24, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="type"
                label={
                  <span className="font-medium text-gray-700">Blog Type</span>
                }
                rules={[
                  { required: true, message: "Please select a blog type!" },
                ]}
              >
                <Select
                  placeholder="Select blog type"
                  className="w-full rounded-lg"
                >
                  {blogTypes.map((type) => (
                    <Option key={type} value={type}>
                      {type}
                    </Option>
                  ))}
                </Select>
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
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Cover Image Upload */}
          <Form.Item
            name="img"
            label={
              <span className="font-medium text-gray-700">Cover Image</span>
            }
          >
            <Upload
              beforeUpload={() => false}
              onChange={handleImageUpload}
              fileList={fileList}
              maxCount={1}
              listType="picture-card"
              className="w-full"
            >
              {fileList.length >= 1 ? null : (
                <div className="flex flex-col items-center justify-center h-full p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 transition-colors">
                  <UploadOutlined
                    className="text-gray-400 text-2xl mb-2"
                    style={{ fontSize: "18px", marginBottom: "10px" }}
                  />
                  <div
                    className="text-sm text-gray-600 font-medium"
                    style={{ fontSize: "10px" }}
                  >
                    Click to Upload
                  </div>
                  <div
                    className="text-sm text-gray-600 font-medium"
                    style={{ fontSize: "8px", marginTop: "4px" }}
                  >
                    Kích thước &lt; 2Mb
                  </div>
                </div>
              )}
            </Upload>
          </Form.Item>

          {/* Submit Button */}
          <Form.Item className="mt-8">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="w-full md:w-48 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 border-none text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              {loading ? "Processing..." : "Publish Post"}
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
    </div>
  );
};

export default AddBlog;
