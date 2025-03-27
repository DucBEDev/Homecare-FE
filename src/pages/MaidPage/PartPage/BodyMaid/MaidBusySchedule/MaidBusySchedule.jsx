import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Avatar,
  Row,
  Col,
  Typography,
  Button,
  Badge,
  ConfigProvider,
  Tooltip,
  Modal,
  Calendar,
  Tag,
  Spin,
  Empty,
  Form,
  TimePicker,
  Input,
  message,
  Alert,
  Select,
} from "antd";
import {
  EditOutlined,
  InfoCircleOutlined,
  CalendarOutlined,
  UserOutlined,
  IdcardOutlined,
  PhoneOutlined,
  HomeOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PlusOutlined,
  ExclamationCircleOutlined,
  ScheduleOutlined,
} from "@ant-design/icons";
import axios from "axios";
import moment from "moment";
import { useLocation } from "react-router-dom";
import "./MaidBusySchedule.css";

const { Text, Title, Paragraph } = Typography;
const { Option } = Select;

const MaidBusySchedule = () => {
  const location = useLocation();
  const helperId = location.state?.id;
  const [selectedDate, setSelectedDate] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [helper, setHelper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeOffs, setTimeOffs] = useState([]);
  const [dateSchedule, setDateSchedule] = useState({
    workingDateList: [],
    busyDateList: [],
  });
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(moment());
  const [form] = Form.useForm();

  // Fetch helper information and time offs
  const fetchHelper = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}admin/timeOffs/${helperId}`
      );
      setHelper(response.data.helperInfo);
      setTimeOffs(response.data.timeOffs);
    } catch (error) {
      console.error("Error fetching helper:", error);
      message.error("Không thể tải thông tin người giúp việc");
    } finally {
      setLoading(false);
    }
  };

  // Fetch schedule details for a specific date
  const fetchDateSchedule = async (date) => {
    try {
      setScheduleLoading(true);
      const formattedDate = moment(date).format("YYYY-MM-DD");
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}admin/timeOffs/detailSchedule/${helperId}/${formattedDate}`
      );
      setDateSchedule(response.data);
      setSelectedDate(date);
      setDetailModalVisible(true);
    } catch (error) {
      console.error("Error fetching date schedule:", error);
      message.error("Không thể tải lịch chi tiết cho ngày này");
    } finally {
      setScheduleLoading(false);
    }
  };

  const getValidDateRange = () => {
    const today = moment();
    const startDate = today.clone().subtract(2, "days");
    const endDate = today.clone().add(28, "days");

    return { startDate, endDate };
  };

  // Create a new time off
  const createTimeOff = async (values) => {
    try {
      setLoading(true);
      const formattedDate = moment(selectedDate).format("YYYY-MM-DD");

      const payload = {
        helper_id: helperId,
        dateOff: formattedDate,
        startTime: values.timeRange[0].format("HH:mm"),
        endTime: values.timeRange[1].format("HH:mm"),
        reason: values.reason,
        status: "approved",
      };

      await axios.post(
        `${process.env.REACT_APP_API_URL}admin/timeOffs/createDateOff`,
        payload
      );

      message.success("Tạo lịch nghỉ thành công");
      setCreateModalVisible(false);
      fetchHelper(); // Refresh the data
      form.resetFields();
    } catch (error) {
      console.error("Error creating time off:", error);
      message.error(error.response?.data?.error || "Không thể tạo lịch nghỉ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (helperId) {
      fetchHelper();
    }
  }, [helperId]);

  // Handle date cell render in Calendar
  const dateCellRender = (date) => {
    // Check if date has any time offs
    const dateStr = date.format("YYYY-MM-DD");
    const dayTimeOffs = timeOffs.filter(
      (timeOff) => moment(timeOff.dateOff).format("YYYY-MM-DD") === dateStr
    );

    // Determine if helper has workings on this date (we would need to fetch this data)
    const hasWork = Math.random() > 0.7; // Placeholder logic for demo

    if (dayTimeOffs.length > 0) {
      return (
        <div className="date-cell date-cell-busy">
          <Badge color="#f50" />
          <div className="time-slots">
            {dayTimeOffs.map((timeOff, idx) => (
              <Tag key={idx} color="error" style={{ margin: "2px 0" }}>
                <ClockCircleOutlined /> {timeOff.startTime}-{timeOff.endTime}
              </Tag>
            ))}
          </div>
        </div>
      );
    } else if (hasWork) {
      return (
        <div className="date-cell date-cell-work">
          <Badge color="#1890ff" />
          <Text className="work-indicator">Có lịch làm việc</Text>
        </div>
      );
    }

    return (
      <div className="date-cell date-cell-free">
        <Badge color="#52c41a" />
      </div>
    );
  };

  // Check if the date is a weekend
  const isWeekend = (date) => {
    if (!date) return false;
    const day = date.day();
    return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
  };

  // Handle date selection in Calendar
  const handleDateSelect = (date) => {
    // Check if the date is within the valid range
    const { startDate, endDate } = getValidDateRange();
    if (date.isBefore(startDate) || date.isAfter(endDate)) {
      return;
    }
    fetchDateSchedule(date);
  };

  // Handle month change in Calendar
  const handleMonthChange = (date) => {
    setSelectedMonth(date);
  };

  // Function to check if a date is disabled
  const disabledDate = (currentDate) => {
    const { startDate, endDate } = getValidDateRange();
    return currentDate.isBefore(startDate, 'day') || currentDate.isAfter(endDate, 'day');
  };

  // Format time for display
  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(":");
    return `${hours}:${minutes}`;
  };

  // Render working schedule section
  const renderWorkingSchedule = () => {
    if (dateSchedule.workingDateList.length === 0) {
      return <Empty description="Không có lịch làm việc cho ngày này" />;
    }

    return (
      <div className="schedule-list">
        {dateSchedule.workingDateList.map((item, index) => {
          const startTime = moment()
            .startOf("day")
            .add(item.startTime, "minutes")
            .format("HH:mm");
          const endTime = moment()
            .startOf("day")
            .add(item.endTime, "minutes")
            .format("HH:mm");

          return (
            <div key={index} className="schedule-item work-item">
              <div className="schedule-badge">
                <Badge status="processing" />
              </div>
              <div className="schedule-content">
                <div className="schedule-time">
                  <ClockCircleOutlined /> {startTime} - {endTime}
                </div>
                <div className="schedule-info">
                  <Tag color="blue">Lịch làm việc</Tag>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render busy schedule section
  const renderBusySchedule = () => {
    if (dateSchedule.busyDateList.length === 0) {
      return <Empty description="Không có lịch nghỉ cho ngày này" />;
    }

    return (
      <div className="schedule-list">
        {dateSchedule.busyDateList.map((item, index) => {
          const startTime = moment()
            .startOf("day")
            .add(item.startTime, "minutes")
            .format("HH:mm");
          const endTime = moment()
            .startOf("day")
            .add(item.endTime, "minutes")
            .format("HH:mm");

          return (
            <div key={index} className="schedule-item busy-item">
              <div className="schedule-badge">
                <Badge status="error" />
              </div>
              <div className="schedule-content">
                <div className="schedule-time">
                  <ClockCircleOutlined /> {startTime} - {endTime}
                </div>
                <div className="schedule-info">
                  <Tag color="error">Lịch nghỉ</Tag>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render helper's legend items
  const renderLegend = () => {
    const items = [
      { color: "#52c41a", text: "Ngày rảnh" },
      { color: "#1890ff", text: "Ngày có lịch làm việc" },
      { color: "#f50", text: "Ngày có lịch nghỉ" },
    ];

    return (
      <div className="calendar-legend">
        {items.map((item, idx) => (
          <div key={idx} className="legend-item">
            <Badge color={item.color} />
            <span>{item.text}</span>
          </div>
        ))}
      </div>
    );
  };

  // Show create time off modal
  const showCreateModal = () => {
    form.resetFields();
    setCreateModalVisible(true);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
        <div>Đang tải thông tin...</div>
      </div>
    );
  }

  if (!helper) {
    return <Empty description="Không tìm thấy thông tin người giúp việc" />;
  }

  const helperInfo = {
    cmnd: helper.helper_id || "Chưa cập nhật",
    name: helper.fullName || "Chưa cập nhật",
    birthDate: moment(helper.birthDate).format("DD/MM/YYYY"),
    phone: helper.phone || "Chưa cập nhật",
    workingArea: helper.workingArea?.province || "Chưa cập nhật",
    district: helper.workingArea?.district || "Chưa cập nhật",
  };

  // Get valid date range
  const { startDate, endDate } = getValidDateRange();

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#1677ff",
          borderRadius: 8,
        },
      }}
    >
      <div className="maid-schedule-container">
        <div className="maid-schedule-header">
          <div className="header-title">
            <ScheduleOutlined className="header-icon" />
            <span>Quản lý lịch nghỉ người giúp việc</span>
          </div>
        </div>

        <Row gutter={[24, 24]}>
          {/* Helper Information Card */}
          <Col xs={24} lg={8}>
            <Card
              className="helper-info-card"
              title={
                <div className="card-title">
                  <UserOutlined className="title-icon" />
                  <span>Thông tin người giúp việc</span>
                </div>
              }
            >
              <div className="helper-avatar-section">
                <Avatar
                  size={100}
                  icon={<UserOutlined />}
                  className="helper-avatar"
                />
                <div className="helper-name-section">
                  <Title level={4}>{helperInfo.name}</Title>
                  <Text type="secondary">Người giúp việc</Text>
                </div>
              </div>

              <div className="helper-details">
                <div className="detail-item">
                  <div className="detail-label">
                    <IdcardOutlined className="detail-icon" />
                    <span>CMND/CCCD:</span>
                  </div>
                  <div className="detail-value">{helperInfo.cmnd}</div>
                </div>

                <div className="detail-item">
                  <div className="detail-label">
                    <CalendarOutlined className="detail-icon" />
                    <span>Ngày sinh:</span>
                  </div>
                  <div className="detail-value">{helperInfo.birthDate}</div>
                </div>

                <div className="detail-item">
                  <div className="detail-label">
                    <PhoneOutlined className="detail-icon" />
                    <span>Số điện thoại:</span>
                  </div>
                  <div className="detail-value">{helperInfo.phone}</div>
                </div>

                <div className="detail-item">
                  <div className="detail-label">
                    <EnvironmentOutlined className="detail-icon" />
                    <span>Khu vực làm việc:</span>
                  </div>
                  <div className="detail-value">{helperInfo.workingArea}</div>
                </div>

                <div className="detail-item">
                  <div className="detail-label">
                    <EnvironmentOutlined className="detail-icon" />
                    <span>Quận:</span>
                  </div>
                  <div className="detail-value">{helperInfo.district}</div>
                </div>
              </div>

              <div className="add-time-off-section">
                <Alert
                  message="Lưu ý khi tạo lịch nghỉ"
                  description="Vui lòng kiểm tra kỹ lịch làm việc trước khi tạo lịch nghỉ để tránh xung đột."
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  block
                  onClick={() => {
                    setSelectedDate(moment());
                    showCreateModal();
                  }}
                >
                  Tạo lịch nghỉ mới
                </Button>
              </div>
            </Card>

            <Card
              className="schedule-summary-card"
              title={
                <div className="card-title">
                  <InfoCircleOutlined className="title-icon" />
                  <span>Thống kê lịch nghỉ</span>
                </div>
              }
              style={{ marginTop: 24 }}
            >
              <div className="summary-stat-list">
                <div className="summary-stat">
                  <div className="stat-number">{timeOffs.length}</div>
                  <div className="stat-label">
                    Tổng số lịch nghỉ trong tháng
                  </div>
                </div>
                <div className="summary-stat">
                  <div className="stat-number">
                    {timeOffs.filter((t) => t.status === "approved").length}
                  </div>
                  <div className="stat-label">Đã được duyệt</div>
                </div>
                <div className="summary-stat">
                  <div className="stat-number">
                    {timeOffs.filter((t) => t.status === "done").length}
                  </div>
                  <div className="stat-label">Đã hoàn thành</div>
                </div>
              </div>

              {renderLegend()}
            </Card>
          </Col>

          {/* Calendar Card */}
          <Col xs={24} lg={16}>
            <Card
              className="calendar-card"
              title={
                <div className="card-title">
                  <CalendarOutlined className="title-icon" />
                  <span>Lịch nghỉ của {helperInfo.name}</span>
                </div>
              }
            >
              <div className="calendar-month">
                <Text strong>{selectedMonth.format("MMMM YYYY")}</Text>
                <div className="calendar-range-indicator">
                  <CalendarOutlined />
                  <span>
                    {startDate.format("DD/MM/YYYY")} - {endDate.format("DD/MM/YYYY")}
                  </span>
                </div>
              </div>
              <Calendar
                fullscreen={false}
                dateCellRender={dateCellRender}
                onSelect={handleDateSelect}
                onChange={handleMonthChange}
                className="helper-calendar"
                headerRender={() => null}
                validRange={[startDate, endDate]}
                disabledDate={disabledDate}
              />
            </Card>
          </Col>
        </Row>

        {/* Date Detail Modal */}
        <Modal
          title={
            <div className="modal-title">
              <CalendarOutlined className="modal-title-icon" />
              <span>
                Chi tiết lịch trình ngày{" "}
                {selectedDate && selectedDate.format("DD/MM/YYYY")}
              </span>
            </div>
          }
          open={detailModalVisible}
          onCancel={() => setDetailModalVisible(false)}
          footer={[
            <Button
              key="create"
              type="primary"
              onClick={showCreateModal}
              icon={<PlusOutlined />}
            >
              Tạo lịch nghỉ
            </Button>,
            <Button key="close" onClick={() => setDetailModalVisible(false)}>
              Đóng
            </Button>,
          ]}
          width={700}
          className="schedule-detail-modal"
        >
          {scheduleLoading ? (
            <div className="modal-loading">
              <Spin size="large" />
            </div>
          ) : (
            <div className="schedule-detail-content">
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Alert
                    message={
                      isWeekend(selectedDate)
                        ? "Đây là ngày cuối tuần"
                        : "Đây là ngày trong tuần"
                    }
                    type={
                      selectedDate && isWeekend(selectedDate)
                        ? "warning"
                        : "info"
                    }
                    showIcon
                    style={{ marginBottom: 16 }}
                  />
                </Col>
                <Col xs={24} md={12}>
                  <Card
                    title={
                      <div className="section-title">
                        <CheckCircleOutlined className="section-icon success" />
                        <span>Lịch làm việc</span>
                      </div>
                    }
                    className="schedule-section-card"
                  >
                    {renderWorkingSchedule()}
                  </Card>
                </Col>
                <Col xs={24} md={12}>
                  <Card
                    title={
                      <div className="section-title">
                        <CloseCircleOutlined className="section-icon error" />
                        <span>Lịch nghỉ</span>
                      </div>
                    }
                    className="schedule-section-card"
                  >
                    {renderBusySchedule()}
                  </Card>
                </Col>
              </Row>
            </div>
          )}
        </Modal>

        {/* Create Time Off Modal */}
        <Modal
          title={
            <div className="modal-title">
              <PlusOutlined className="modal-title-icon" />
              <span>Tạo lịch nghỉ mới</span>
            </div>
          }
          open={createModalVisible}
          onCancel={() => setCreateModalVisible(false)}
          okText="Tạo lịch"
          cancelText="Hủy"
          okButtonProps={{
            icon: <PlusOutlined />,
            loading: loading,
          }}
          onOk={() => {
            form
              .validateFields()
              .then((values) => {
                createTimeOff(values);
              })
              .catch((info) => {
                console.log("Validate Failed:", info);
              });
          }}
          className="create-time-off-modal"
        >
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              date: selectedDate || moment(),
              timeRange: [moment("08:00", "HH:mm"), moment("12:00", "HH:mm")],
              reason: "",
            }}
          >
            <Form.Item
              name="date"
              label="Ngày nghỉ"
              rules={[{ required: true, message: "Vui lòng chọn ngày!" }]}
            >
              <Input
                disabled={true}
                value={
                  selectedDate
                    ? selectedDate.format("DD/MM/YYYY")
                    : moment().format("DD/MM/YYYY")
                }
              />
            </Form.Item>

            <Form.Item
              name="timeRange"
              label="Khung giờ nghỉ"
              rules={[{ required: true, message: "Vui lòng chọn khung giờ!" }]}
            >
              <TimePicker.RangePicker
                style={{ width: "100%" }}
                format="HH:mm"
                placeholder={["Giờ bắt đầu", "Giờ kết thúc"]}
              />
            </Form.Item>

            <Form.Item
              name="reason"
              label="Lý do nghỉ"
              rules={[{ required: true, message: "Vui lòng nhập lý do nghỉ!" }]}
            >
              <Input.TextArea rows={4} placeholder="Nhập lý do nghỉ..." />
            </Form.Item>

            <Form.Item name="status" label="Trạng thái" initialValue="approved">
              <Select disabled>
                <Option value="approved">Đã duyệt</Option>
                <Option value="rejected">Từ chối</Option>
                <Option value="done">Hoàn thành</Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </ConfigProvider>
  );
};

export default MaidBusySchedule;