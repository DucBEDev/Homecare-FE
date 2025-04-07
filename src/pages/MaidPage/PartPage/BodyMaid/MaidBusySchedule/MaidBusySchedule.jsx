import React, { useEffect, useState } from "react";
import {
  Card,
  Avatar,
  Typography,
  Spin,
  Empty,
  ConfigProvider,
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
  const [loading, setLoading] = useState(true);

  // Fetch helper information
  const fetchHelper = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}admin/timeOffs/${helperId}`
      );
      setHelper(response.data.helperInfo);
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

        <Card className="helper-info-card">
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
      </div>
    </ConfigProvider>
  );
};

export default MaidBusySchedule;