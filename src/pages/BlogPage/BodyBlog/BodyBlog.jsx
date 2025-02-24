import React, { useState, useEffect, useCallback } from "react";
import {
  Pagination,
  Table,
  Modal,
  Form,
  Input,
  Select,
  Button,
  Row,
  Col,
} from "antd";
import axios from "axios";
import ButtonComponent from "../../../components/ButtonComponent/ButtonComponent";
import NotificationComponent from "../../../components/NotificationComponent/NotificationComponent";
import { useNavigate } from "react-router-dom";

const { TextArea } = Input;

const BlogManagementTable = () => {
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null); // Correctly stored the Blog
  const [form] = Form.useForm();
  const [showNotification, setShowNotification] = useState(null);
  const [pageSize, setPageSize] = useState(5);
  const navigate = useNavigate();

  // State và function cho Delete Modal
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState(null);

  const columns = [
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Tác giả",
      dataIndex: "author",
      key: "author",
      sorter: (a, b) => a.author.localeCompare(b.author),
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      sorter: (a, b) => a.type.localeCompare(b.type),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      sorter: (a, b) => a.status.localeCompare(b.status),
    },
    {
      title: "Lựa chọn",
      key: "action",
      render: (_, record) => (
        <span className="column-with-icon action-icon">
          <ButtonComponent
            size="large"
            textButton="Sửa"
            styleButton={{
              backgroundColor: "#3cbe5d",
              width: "40px",
              height: "40px",
              border: "1px",
              borderRadius: "12px",
              marginRight: "2px",
            }}
            styleButtonText={{ color: "#fff" }}
            onClick={() => handleEdit(record.key)}
          />
          <ButtonComponent
            size="large"
            textButton="Xem"
            styleButton={{
              backgroundColor: "#3ebedd",
              width: "40px",
              height: "40px",
              border: "1px",
              borderRadius: "12px",
              marginRight: "2px",
            }}
            styleButtonText={{ color: "#fff" }}
            onClick={() => navigate("/blog/view")}
          />
          <ButtonComponent
            size="large"
            textButton="Xóa"
            styleButton={{
              backgroundColor: "#d22d2d",
              width: "40px",
              height: "40px",
              border: "1px",
              borderRadius: "12px",
            }}
            styleButtonText={{ color: "#fff" }}
            onClick={() => showDeleteConfirm(record.key)}
          />
        </span>
      ),
    },
  ];

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}admin/blogs`
      );
      const transformedData = response.data.blogs.map((blog) => ({
        key: blog._id,
        title: blog.title,
        description: blog.description,
        img: blog.img,
        content: blog.content,
        author: blog.author,
        type: blog.type,
        status: blog.status === "active" ? "Đang hiển thị" : "Tạm ẩn",
      }));
      setBlogs(transformedData);
      setFilteredData(transformedData);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      setShowNotification({
        status: "error",
        message: "Lỗi",
        description: `Lỗi khi tải dữ liệu blogs: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const getCurrentPageData = useCallback(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [currentPage, filteredData, pageSize]);

  const handleEdit = (recordId) => {
    const selected = blogs.find((blog) => blog.key === recordId);
    setSelectedBlog(selected);
    form.setFieldsValue(selected);
    setIsEditModalVisible(true);
  };

  // Delete Modal Functions
  const showDeleteConfirm = (recordId) => {
    const selected = blogs.find((blog) => blog.key === recordId); // Find the blog
    setSelectedBlog(selected); // Store the selected blog for display
    setBlogToDelete(recordId);
    setIsDeleteModalVisible(true);
  };

  const hideDeleteConfirm = () => {
    setIsDeleteModalVisible(false);
    setBlogToDelete(null);
    setSelectedBlog(null); // Clear the selected blog
  };

  const handleConfirmDelete = async () => {
    if (!blogToDelete) return;
    setLoading(true);
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}admin/blogs/deleteBlog/${blogToDelete}`
      );
      if (response.status === 200) {
        setBlogs((prevBlogs) =>
          prevBlogs.filter((blog) => blog.key !== blogToDelete)
        );
        setFilteredData((prevFilteredData) =>
          prevFilteredData.filter((blog) => blog.key !== blogToDelete)
        );
        setShowNotification({
          status: "success",
          message: "Thành công",
          description: "Xóa bài viết thành công",
        });
      } else {
        setShowNotification({
          status: "error",
          message: "Thất bại",
          description: `Lỗi khi xóa bài viết (HTTP ${response.status})`,
        });
      }
    } catch (error) {
      setShowNotification({
        status: "error",
        message: "Thất bại",
        description: `Lỗi khi xóa bài viết: ${error.message}`,
      });
    } finally {
      setLoading(false);
      hideDeleteConfirm();
      setTimeout(() => setShowNotification(null), 3000);
    }
  };

  const handleDelete = async (recordId) => {
    hideDeleteConfirm();
    handleConfirmDelete();
  };

  const handleOk = () => {
    form.submit();
  };

  const handleCancel = () => {
    setIsEditModalVisible(false);
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await axios.patch(
        `${process.env.REACT_APP_API_URL}admin/blogs/edit/${selectedBlog.key}`,
        values
      );

      if (response.data.success) {
        const updatedBlogs = blogs.map((blog) =>
          blog.key === selectedBlog.key ? { ...blog, ...values } : blog
        );
        setBlogs(updatedBlogs);
        setFilteredData(updatedBlogs);

        setShowNotification({
          status: "success",
          message: "Thành công",
          description: "Cập nhật bài viết thành công!",
        });
      } else {
        setShowNotification({
          status: "error",
          message: "Thất bại",
          description: "Cập nhật bài viết thất bại!",
        });
      }
    } catch (error) {
      setShowNotification({
        status: "error",
        message: "Lỗi",
        description: `Lỗi khi cập nhật: ${error.message}`,
      });
      console.error("Lỗi khi cập nhật bài viết:", error);
    } finally {
      setLoading(false);
      setIsEditModalVisible(false);
      setTimeout(() => setShowNotification(null), 3000);
    }
  };

  return (
    <div className="blog-management-container">
      <Table
        columns={columns}
        dataSource={getCurrentPageData()}
        loading={loading}
        rowKey="key"
        scroll={{ x: 1000 }}
        pagination={false}
      />
      <div className="pagination-container">
        <Pagination
                align="center"
                current={currentPage}
                total={filteredData.length}
                pageSize={pageSize}
                onChange={setCurrentPage}
                hideOnSinglePage={true}
                showLessItems={true}
                style={{
                  fontSize: "26px",
                  transform: "translateX(-20px)",
                  marginTop: "10px",
                  position: "fixed",
                  bottom: "20px",
                  left: "50%",
                  zIndex: 1000,
                }}
              />
      </div>
      {showNotification && (
        <NotificationComponent
          status={showNotification.status}
          message={showNotification.message}
          description={showNotification.description}
        />
      )}

      {/* Edit Modal */}
      <Modal
        title="Chỉnh sửa bài viết"
        open={isEditModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Lưu"
        cancelText="Hủy"
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
          >
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item
            name="img"
            label="Hình ảnh URL"
            rules={[{ required: true, message: "Vui lòng nhập URL hình ảnh!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="content"
            label="Nội dung"
            rules={[{ required: true, message: "Vui lòng nhập nội dung!" }]}
          >
            <TextArea rows={6} />
          </Form.Item>
          <Form.Item
            name="author"
            label="Tác giả"
            rules={[{ required: true, message: "Vui lòng nhập tên tác giả!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="type"
            label="Loại"
            rules={[
              { required: true, message: "Vui lòng chọn loại bài viết!" },
            ]}
          >
            <Select>
              <Select.Option value="Quảng cáo">Quảng cáo</Select.Option>
              <Select.Option value="Thông báo chính sách">
                Thông báo chính sách
              </Select.Option>
              <Select.Option value="Tin tức">Tin tức</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
          >
            <Select>
              <Select.Option value="active">Hiển thị</Select.Option>
              <Select.Option value="inactive">Tạm ẩn</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Xác nhận xóa bài viết"
        visible={isDeleteModalVisible}
        onCancel={hideDeleteConfirm}
        footer={[
          <Button
            key="delete"
            danger
            type="primary"
            onClick={handleConfirmDelete}
            className="delete-button"
          >
            Đồng ý
          </Button>,
          <Button key="cancel" onClick={hideDeleteConfirm}>
            Hủy
          </Button>,
        ]}
        width={600}
      >
        <div className="popup-content">
          <div className="info-section">
            <p style={{ marginBottom: 20, fontWeight: "bold" }}>
              Bạn có chắc chắn muốn xóa bài viết này không?
            </p>
            {selectedBlog && (
              <>
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <div
                      className="info-item"
                    >
                      <span>Tiêu đề:</span>
                      <span  style={{
                          width: "84%",
                          wordBreak: "break-word",
                        }}>{selectedBlog.title}</span>
                    </div>
                  </Col>
                  <Col span={24}>
                    <div className="info-item">
                      <span>Tác giả:</span>
                      <span  style={{
                          width: "84%",
                          wordBreak: "break-word",
                        }}>{selectedBlog.author}</span>
                    </div>
                  </Col>
                  <Col span={24}>
                    <div className="info-item">
                      <span>Loại:</span>
                      <span  style={{
                          width: "84%",
                          wordBreak: "break-word",
                        }}>{selectedBlog.type}</span>
                    </div>
                  </Col>
                  <Col span={24}>
                    <div className="info-item">
                      <span>Mô tả:</span>
                      <span
                        style={{
                          width: "84%",
                          wordBreak: "break-word",
                        }}
                      >
                        {selectedBlog.description}
                      </span>
                    </div>
                  </Col>
                </Row>
              </>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BlogManagementTable;
