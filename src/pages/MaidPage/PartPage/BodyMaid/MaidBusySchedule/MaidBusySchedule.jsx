import React, { useEffect, useState } from "react";
import {
  Card,
  Avatar,
  Typography,
  Spin,
  Empty,
  ConfigProvider,
  Badge,
  Calendar,
  Modal,
  List,
  Space,
  Button,
  TimePicker,
  Form,
  message,
  Row,
  Col,
  Input,
} from "antd";
import {
  UserOutlined,
  IdcardOutlined,
  CalendarOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  UpOutlined,
  DownOutlined,
} from "@ant-design/icons";
import axios from "axios";
import moment from "moment";
import dayjs from "dayjs";
import { useLocation } from "react-router-dom";
import "./MaidBusySchedule.css";

const { Text, Title } = Typography;

const MaidBusySchedule = () => {
  const location = useLocation();
  const helperId = location.state?.id;
  const [helper, setHelper] = useState(null);
  const [timeOffs, setTimeOffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dateDetails, setDateDetails] = useState({
    workingDateList: [],
    busyDateList: [],
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [isAddingDateOff, setIsAddingDateOff] = useState(false);
  const [newTimeOff, setNewTimeOff] = useState({
    startTime: null,
    endTime: null,
    reason: "",
  });

  // Fetch helper information and timeoffs
  const fetchHelper = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}admin/timeOffs/${helperId}`
      );
      console.log("Schedule GET", response.data);

      setHelper(response.data.helperInfo);
      setTimeOffs(response.data.timeOffs);
    } catch (error) {
      console.error("Error fetching helper:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (helperId) {
      fetchHelper();
    }
  }, [helperId]);

  // Fetch detail schedule for a specific date
  const fetchDateDetails = async (date) => {
    try {
      setModalLoading(true);
      const formattedDate = date.format("YYYY-MM-DD");
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}admin/timeOffs/detailSchedule/${helperId}/${formattedDate}`
      );
      console.log("Sechdule", response.data);

      setDateDetails(response.data);
    } catch (error) {
      console.error("Error fetching date details:", error);
    } finally {
      setModalLoading(false);
    }
  };


  // Get data for calendar cell rendering
  const getTimeOffData = (value) => {
    const formattedDate = value.format("YYYY-MM-DD");
    return timeOffs.filter((timeOff) => timeOff.dateOff === formattedDate);
  };

  // Calendar cell rendering
  const dateCellRender = (value) => {
    const listData = getTimeOffData(value);
    if (listData.length === 0) return null;

    // Get the status of the first timeOff for this date
    const status = listData[0].status;

    // Map status to background colors (using lighter shades for better visibility)
    let backgroundColor = "transparent";
    if (status === "approved") backgroundColor = "#ffccc7"; // Light red
    else if (status === "done") backgroundColor = "#d9f7be"; // Light green

    return (
      <div
        style={{
          height: "100%",
          width: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          backgroundColor,
          opacity: 0.7,
          zIndex: 0,
        }}
      />
    );
  };

  // Handle date selection
  const onSelect = (date) => {
    setSelectedDate(date);
    fetchDateDetails(date);
    setModalVisible(true);
    setIsAddingDateOff(false);
    setNewTimeOff({ startTime: null, endTime: null, reason: "" });
  };

  // Format minute value to time string
  const formatTimeFromMinutes = (minutes) => {
    if (minutes === undefined || minutes === null) return "00:00";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}`;
  };

  // Legend component to explain colors
  const CalendarLegend = () => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = () => {
      setIsExpanded(!isExpanded);
    };

    return (
      <div style={{ marginTop: "10px", padding: "10px" }}>
        <div
          onClick={toggleExpand}
          style={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Title
            level={5}
            style={{ margin: 0, display: "flex", alignItems: "center" }}
          >
            Chú thích
            <span style={{ marginLeft: "6px", fontSize: "20px" }}>
              {isExpanded ? <UpOutlined /> : <DownOutlined />}
            </span>
          </Title>
        </div>

        {isExpanded && (
          <Space direction="vertical" style={{ marginTop: 8 }}>
            <Badge status="error" text="Đang bận" />
            <Badge status="success" text="Đã hoàn thành lịch bận" />
            <Badge color="blue" status="click" text="Đang làm việc" />
          </Space>
        )}
      </div>
    );
  };

  const handleAddDateOff = () => {
    setIsAddingDateOff(true);
  };

  const onTimeOffFormChange = (values) => {
    const newStartTime = values.startTime
      ? moment(values.startTime).format("HH:mm")
      : null;
    const newEndTime = values.endTime
      ? moment(values.endTime).format("HH:mm")
      : null;
    setNewTimeOff({
      ...newTimeOff,
      startTime: newStartTime,
      endTime: newEndTime,
      reason: values.reason,
    });
  };

  // Cập nhật hàm handleCreateTimeOff
  const handleCreateTimeOff = async () => {
    if (!newTimeOff.startTime || !newTimeOff.endTime) {
      message.error("Vui lòng chọn thời gian bắt đầu và kết thúc.");
      return;
    }
    console.log("cakasubfa dating off");

    // Kiểm tra thời gian kết thúc phải sau thời gian bắt đầu
    const startMinutes = convertTimeToMinutes(newTimeOff.startTime);
    const endMinutes = convertTimeToMinutes(newTimeOff.endTime);
    if (endMinutes <= startMinutes) {
      message.error("Thời gian kết thúc phải sau thời gian bắt đầu.");
      return;
    }

    try {
      
      setModalLoading(true);
      const formattedDate = selectedDate.format("YYYY-MM-DD");
      const startMinutes = convertTimeToMinutes(newTimeOff.startTime);
      const endMinutes = convertTimeToMinutes(newTimeOff.endTime);
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}admin/timeOffs/createDateOff/${formattedDate}`,
        {
          helper_id: helperId,
          startTime: startMinutes,
          endTime: endMinutes,
          reason: newTimeOff.reason || "Không có lý do",
        }
      );

      if (response.data.success) {
        message.success("Thêm ngày nghỉ thành công");
        // Cập nhật lại dữ liệu
        await fetchHelper();
        await fetchDateDetails(selectedDate);
        // Đóng form và reset dữ liệu
        setIsAddingDateOff(false);
        setNewTimeOff({ startTime: null, endTime: null, reason: "" });
        setModalVisible(false);
      }
    } catch (error) {
      if (error.response?.status === 400) {
        message.error(error.response.data.error || "Thời gian này đã được đặt");
        console.log(
          "Date off time overlaps with existing date offs"
        );
      } else {
        message.error("Có lỗi xảy ra khi thêm ngày nghỉ");
        console.log("Error creating time off:", error.response?.data || error);
      }
      console.log("Error creating time off:", error);
    } finally {
      setModalLoading(false);
    }
  };

  // Thêm hàm helper để chuyển đổi thời gian
  const convertTimeToMinutes = (timeString) => {
    if (!timeString) return 0;
    const [hours, minutes] = timeString.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const disabledMinutes = () => {
    return []; // Allow all minutes
  };

  // Cập nhật renderAddTimeOffForm
  const renderAddTimeOffForm = () => {
    if (!isAddingDateOff) return null;

    return (
      <div style={{ marginTop: 20 }}>
        <Title level={5}>
          Thêm ngày nghỉ cho ngày {selectedDate.format("DD/MM/YYYY")}
        </Title>
        <Form
          layout="vertical"
          onValuesChange={onTimeOffFormChange}
          onFinish={handleCreateTimeOff}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Thời gian bắt đầu"
                name="startTime"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn thời gian bắt đầu!",
                  },
                ]}
              >
                <TimePicker
                  format="HH:mm"
                  style={{ width: "100%" }}
                  minuteStep={30}
                  disabledMinutes={disabledMinutes}
                  allowClear={false}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Thời gian kết thúc"
                name="endTime"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn thời gian kết thúc!",
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const startTime = getFieldValue("startTime");
                      if (!startTime || !value) {
                        return Promise.resolve();
                      }
                      if (value.isBefore(startTime)) {
                        return Promise.reject(
                          new Error(
                            "Thời gian kết thúc phải sau thời gian bắt đầu!"
                          )
                        );
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <TimePicker
                  format="HH:mm"
                  style={{ width: "100%" }}
                  minuteStep={30}
                  disabledMinutes={disabledMinutes}
                  allowClear={false}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label="Lý do"
            name="reason"
            rules={[
              { max: 500, message: "Lý do không được vượt quá 500 ký tự!" },
            ]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Nhập lý do nghỉ (không bắt buộc)"
            />
          </Form.Item>
        </Form>
      </div>
    );
  };

  // Render modal content
  const renderModalContent = () => {
    if (modalLoading && !isAddingDateOff) {
      return <Spin size="large" />;
    }
    if (isAddingDateOff) {
      return renderAddTimeOffForm();
    }

    return (
      <div>
        <div style={{ marginBottom: 20 }}>
          <Title level={4}>Lịch làm việc</Title>
          <Text>Không có lịch làm việc</Text>
        </div>

        <div>
          <Title level={4}>Lịch bận</Title>
          {dateDetails.busyDateList && dateDetails.busyDateList.length > 0 ? (
            <List
              size="small"
              bordered
              dataSource={dateDetails.busyDateList}
              renderItem={(item) => {
                const startTime = formatTimeFromMinutes(item.startTime);
                const endTime = formatTimeFromMinutes(item.endTime);

                return (
                  <List.Item>
                    <Badge status="error" text={`${startTime} - ${endTime}`} />
                  </List.Item>
                );
              }}
            />
          ) : (
            <Text>Không có lịch bận</Text>
          )}
        </div>
      </div>
    );
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

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#1677ff",
          borderRadius: 8,
        },
        components: {
          Calendar: {
            fullBg: "transparent",
          },
        },
      }}
    >
      <div className="maid-schedule-container">
        <div style={{ marginTop: "90px" }}></div>
        <div className="header-container">
          <div className="green-header">
            <span className="header-title">
              Các Chỉ Số Hiệu Suất Chính (KPIs)
            </span>
          </div>
        </div>

        <div
          className="content-wrapper"
          style={{ display: "flex", gap: "20px", padding: "20px" }}
        >
          <Card className="helper-info-card" style={{ flex: "3" }}>
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
            <CalendarLegend />
          </Card>

          <div className="calendar-section" style={{ flex: "7" }}>
            <Card>
              <Calendar
                dateCellRender={dateCellRender}
                onSelect={onSelect}
                mode="month"
                fullscreen={true}
                className="custom-calendar"
              />
            </Card>
          </div>
        </div>

        <Modal
          title={
            selectedDate
              ? `Lịch trình ngày ${selectedDate.format("DD/MM/YYYY")}`
              : "Lịch trình"
          }
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            setIsAddingDateOff(false);
            setNewTimeOff({ startTime: null, endTime: null, reason: "" });
          }}
          footer={[
            <Button
              key="back"
              onClick={() => {
                setModalVisible(false);
                setIsAddingDateOff(false);
                setNewTimeOff({ startTime: null, endTime: null, reason: "" });
              }}
            >
              Đóng
            </Button>,
            !isAddingDateOff && (
              <Button key="add" type="primary" onClick={handleAddDateOff}>
                Thêm ngày nghỉ
              </Button>
            ),
            isAddingDateOff && (
              <Button
                key="submit"
                type="primary"
                onClick={handleCreateTimeOff}
                loading={modalLoading}
              >
                Xác nhận
              </Button>
            ),
          ]}
          width={600}
        >
          {renderModalContent()}
        </Modal>
      </div>
    </ConfigProvider>
  );
};

export default MaidBusySchedule;
