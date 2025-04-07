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
      <div style={{ 
        height: '100%',
        width: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        backgroundColor,
        opacity: 0.7,
        zIndex: 0
      }} />
    );
  };

  // Handle date selection
  const onSelect = (date) => {
    setSelectedDate(date);
    fetchDateDetails(date);
    setModalVisible(true);
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
            cursor: 'pointer',
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
         <Title level={5} style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
          Chú thích
          <span style={{ marginLeft: '6px', fontSize: '20px' }}>
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

  // Render modal content
  const renderModalContent = () => {
    if (modalLoading) {
      return <Spin size="large" />;
    }

    return (
      <div>
        <div style={{ marginBottom: 20 }}>
          <Title level={4}>Lịch làm việc</Title>
          {/* {dateDetails.workingDateList && dateDetails.workingDateList.length > 0 ? (
            <List
              size="small"
              bordered
              dataSource={dateDetails.workingDateList}
              renderItem={(item) => {
                // Use the numeric startTime and endTime directly
                const startTime = formatTimeFromMinutes(item.startTime);
                const endTime = formatTimeFromMinutes(item.endTime);
                
                return (
                  <List.Item>
                    <Badge status="processing" text={`${startTime} - ${endTime}`} />
                  </List.Item>
                );
              }}
            />
          ) : (
            <Text>Không có lịch làm việc</Text>
          )} */}
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
                // Use the numeric startTime and endTime directly
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
            fullBg: "transparent", // Make sure calendar background is transparent
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
          onCancel={() => setModalVisible(false)}
          footer={null}
          width={600}
        >
          {renderModalContent()}
        </Modal>
      </div>
    </ConfigProvider>
  );
};

export default MaidBusySchedule;
