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
} from "antd";
import {
  UserOutlined,
  IdcardOutlined,
  CalendarOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
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
  const [dateDetails, setDateDetails] = useState({ workingDateList: [], busyDateList: [] });
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
      const formattedDate = date.format('YYYY-MM-DD');
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
    const formattedDate = value.format('YYYY-MM-DD');
    return timeOffs.filter(timeOff => 
      timeOff.dateOff === formattedDate
    );
  };

  // Calendar cell rendering
  const dateCellRender = (value) => {
    const listData = getTimeOffData(value);
    
    // Only render badge dots, no text content
    return (
      <ul className="events">
        {listData.map((item, index) => {
          // Map status to badge colors
          let badgeStatus = "default";
          if (item.status === "approved") badgeStatus = "error";
          else if (item.status === "done") badgeStatus = "success";
          
          return (
            <li key={index}>
              <Badge status={badgeStatus} />
            </li>
          );
        })}
      </ul>
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
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
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

        <div className="content-wrapper" style={{ display: 'flex', gap: '20px', padding: '20px' }}>
          <Card className="helper-info-card" style={{ flex: '3' }}>
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
          </Card>

          <div className="calendar-section" style={{ flex: '7' }}>
            <Card>
              <Calendar 
                dateCellRender={dateCellRender} 
                onSelect={onSelect}
              />
            </Card>
          </div>
        </div>

        <Modal
          title={selectedDate ? `Lịch trình ngày ${selectedDate.format('DD/MM/YYYY')}` : 'Lịch trình'}
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