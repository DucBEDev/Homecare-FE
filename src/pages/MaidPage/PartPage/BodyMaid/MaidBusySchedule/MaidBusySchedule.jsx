import React, { useState } from "react";
import {
  Card,
  Table,
  Avatar,
  Row,
  Col,
  Typography,
  Button,
  ConfigProvider,
  Tooltip,
  Modal,
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
} from "@ant-design/icons";

const { Text, Title } = Typography;

const MaidBusySchedule = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const helperInfo = {
    cmnd: "2222222",
    name: "Nguyễn Thị A",
    birthDate: "6/4/2003",
    phone: "0789456123",
    district: "q1",
    hometown: "HCM",
  };

  const generateCalendarData = () => {
    const dates = [];
    for (let i = 2; i <= 31; i++) {
      dates.push({
        date: `${i}/3`,
        available: i >= 6,
        timeSlots: i >= 6 ? [] : ["8:00 - 12:00", "13:00 - 17:00"],
      });
    }
    for (let i = 1; i <= 4; i++) {
      dates.push({ date: `${i}/4`, available: true, timeSlots: [] });
    }
    return dates;
  };

  const createCalendarColumns = () => {
    const dates = generateCalendarData();
    const daysOfWeek = ["CN", "TH 2", "TH 3", "TH 4", "TH 5", "TH 6", "TH 7"];
    const rows = [];

    for (let i = 0; i < dates.length; i += 7) {
      const weekDates = dates.slice(i, i + 7);
      const row = {};
      weekDates.forEach((dateInfo, index) => {
        row[daysOfWeek[index]] = dateInfo;
      });
      rows.push(row);
    }

    const columns = daysOfWeek.map((day) => ({
      title: () => (
        <div
          style={{
            fontSize: "14px",
            fontWeight: "bold",
            textAlign: "center",
            backgroundColor: "#8BC34A",
            color: "white",
            padding: "8px 0",
            borderRadius: "4px 4px 0 0",
          }}
        >
          {day}
        </div>
      ),
      dataIndex: day,
      key: day,
      width: 90,
      align: "center",
      render: (dateInfo) => {
        if (!dateInfo) return null;
        const hasTimeSlots = dateInfo.timeSlots?.length > 0; // Use optional chaining

        const style = {
          backgroundColor: dateInfo.available ? "#e6f7e1" : "#f5f5f5",
          border: `1px solid ${dateInfo.available ? "#9CCC65" : "#d9d9d9"}`,
          borderRadius: "4px",
          height: "75px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          cursor: "pointer",
          transition: "all 0.3s",
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          position: "relative",
        };

        return (
          <div
            style={style}
            onClick={() => {
              setSelectedDate(dateInfo);
              setModalVisible(true);
            }}
            className="calendar-date-cell"
          >
            <Text
              strong
              style={{ color: dateInfo.available ? "#4CAF50" : "#757575" }}
            >
              {dateInfo.date}
            </Text>
            {hasTimeSlots && (
              <InfoCircleOutlined
                style={{
                  color: "#FF5252",
                  position: "absolute",
                  right: "5px",
                  top: "5px",
                }}
              />
            )}
          </div>
        );
      },
    }));

    return { columns, rows };
  };

  const { columns, rows } = createCalendarColumns();

  const infoItems = [
    { label: "CMND", value: helperInfo.cmnd, icon: <IdcardOutlined /> },
    { label: "Họ Tên", value: helperInfo.name, icon: <UserOutlined /> },
    {
      label: "Ngày Sinh",
      value: helperInfo.birthDate,
      icon: <CalendarOutlined />,
    },
    { label: "Số ĐT", value: helperInfo.phone, icon: <PhoneOutlined /> },
    {
      label: "Quận",
      value: helperInfo.district,
      icon: <EnvironmentOutlined />,
    },
    { label: "Quê Quán", value: helperInfo.hometown, icon: <HomeOutlined /> },
  ];

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#8BC34A",
          borderRadius: 6,
        },
      }}
    >
      <div
        style={{ background: "#f0f2f5", minHeight: "100vh" }}
      >
        <div style={{ marginTop: "90px" }}></div>
      <div style={{ marginLeft: "20px" }} className="header-container">
        <div className="green-header">
          <span className="header-title">Quản lý người giúp việc</span>
        </div>
      </div>

        <Card
          bordered={false}
          style={{
            backgroundColor: "#FFF",
            borderRadius: "8px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
            marginLeft: "20px"
          }}
        >
          <Row gutter={24}>
            <Col xs={24} md={10}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  position: "relative",
                  borderRight: "1px solid #f0f0f0",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    textAlign: "center",
                    marginBottom: "20px",
                    backgroundColor: "#f9f9f9",
                    borderRadius: "8px",
                    marginLeft: "20px"
                  }}
                >
                  <Avatar
                    size={100}
                    src="avatar"
                    icon={<UserOutlined />}
                    style={{
                      border: "4px solid #fff",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    }}
                  />
                  <Title
                    level={4}
                    style={{ marginTop: "16px", marginBottom: "0" }}
                  >
                    {helperInfo.name}
                  </Title>
                  <Text type="secondary">Người giúp việc</Text>
                </div>

                {infoItems.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      width: "100%",
                      display: "flex",
                      borderBottom:
                        index < infoItems.length - 1
                          ? "1px solid #f0f0f0"
                          : "none",
                      padding: "16px 0",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        width: "40%",
                        textAlign: "right",
                        paddingRight: "20px",
                        fontWeight: "bold",
                        color: "#555",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                      }}
                    >
                      <span style={{ marginRight: "8px" }}>{item.icon}</span>
                      {item.label} :
                    </div>
                    <div
                      style={{
                        width: "60%",
                        backgroundColor: "#f9f9f9",
                        padding: "8px 12px",
                        borderRadius: "4px",
                        border: "1px solid #f0f0f0",
                      }}
                    >
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </Col>
            <Col xs={24} md={14}>
              <div style={{ position: "relative" }}>
                <Button
                  type="primary"
                  shape="circle"
                  icon={<EditOutlined />}
                  style={{
                    position: "absolute",
                    right: 0,
                    top: 0,
                    zIndex: 1,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  }}
                />
                <Table
                  columns={columns}
                  dataSource={rows}
                  pagination={false}
                  bordered
                  rowKey={(record) => JSON.stringify(record)}
                  size="middle"
                  style={{
                    marginTop: "20px",
                    borderRadius: "8px",
                    overflow: "hidden",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  }}
                  className="calendar-table"
                />
              </div>
            </Col>
          </Row>

          <Row style={{ marginTop: "30px" }}>
            <Col span={24}>
              <Card
                style={{
                  borderRadius: "8px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
                title={
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <InfoCircleOutlined
                      style={{ marginRight: "8px", color: "#8BC34A" }}
                    />
                    <span>Chú thích</span>
                  </div>
                }
              >
                <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "10px",
                    }}
                  >
                    <div
                      style={{
                        width: "24px",
                        height: "24px",
                        backgroundColor: "#e6f7e1",
                        marginRight: "10px",
                        border: "1px solid #9CCC65",
                        borderRadius: "4px",
                      }}
                    ></div>
                    <Text>Ngày rảnh</Text>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "10px",
                    }}
                  >
                    <div
                      style={{
                        width: "24px",
                        height: "24px",
                        backgroundColor: "#f5f5f5",
                        marginRight: "10px",
                        border: "1px solid #d9d9d9",
                        borderRadius: "4px",
                      }}
                    ></div>
                    <Text>Ngày có khung giờ bận</Text>
                  </div>
                  <Tooltip title="Nhấp vào từng ngày để xem chi tiết">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "10px",
                        cursor: "help",
                      }}
                    >
                      <InfoCircleOutlined
                        style={{
                          color: "#FF5252",
                          marginRight: "10px",
                          fontSize: "18px",
                        }}
                      />
                      <Text italic>
                        Nhấp vào từng ngày để coi chi tiết thông tin bận
                      </Text>
                    </div>
                  </Tooltip>
                </div>
              </Card>
            </Col>
          </Row>
        </Card>

        <Modal
          title={
            <div style={{ display: "flex", alignItems: "center" }}>
              <CalendarOutlined
                style={{ marginRight: "8px", color: "#8BC34A" }}
              />
              <span>Chi tiết ngày {selectedDate?.date}</span>
            </div>
          }
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={[
            <Button key="back" onClick={() => setModalVisible(false)}>
              Đóng
            </Button>,
          ]}
        >
          {selectedDate && (
            <div>
              <div
                style={{
                  padding: "12px",
                  backgroundColor: selectedDate.available
                    ? "#e6f7e1"
                    : "#f5f5f5",
                  borderRadius: "6px",
                  marginBottom: "16px",
                  border: `1px solid ${
                    selectedDate.available ? "#9CCC65" : "#d9d9d9"
                  }`,
                }}
              >
                <Text strong>Trạng thái: </Text>
                <Text>{selectedDate.available ? "Rảnh" : "Có lịch bận"}</Text>
              </div>

              {selectedDate.timeSlots && selectedDate.timeSlots.length > 0 ? (
                <div>
                  <Text strong>Khung giờ bận:</Text>
                  <ul style={{ marginTop: "8px" }}>
                    {selectedDate.timeSlots.map((slot, index) => (
                      <li key={index} style={{ marginBottom: "8px" }}>
                        <div
                          style={{
                            padding: "8px 12px",
                            backgroundColor: "#fff1f0",
                            borderRadius: "4px",
                            border: "1px solid #ffccc7",
                          }}
                        >
                          {slot}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <Text>Không có khung giờ bận trong ngày này.</Text>
              )}
            </div>
          )}
        </Modal>
      </div>
    </ConfigProvider>
  );
};

export default MaidBusySchedule;
