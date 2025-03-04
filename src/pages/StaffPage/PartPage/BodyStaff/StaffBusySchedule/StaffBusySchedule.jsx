import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, Descriptions, Table, Button, Typography, Modal } from "antd";
import axios from "axios";
import { CheckCircleOutlined } from "@ant-design/icons";
import moment from 'moment';

const { Title } = Typography;

const StaffBusySchedule = () => {
    const location = useLocation();
    const { id } = location.state || {}; // maidId
    const navigate = useNavigate();
    const [maidInfo, setMaidInfo] = useState(null);
    const [scheduleData, setScheduleData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMaidInfo = async () => {
            try {
                const response = await axios.get(`/admin/timeOffs/${id}`); // API endpoint to get maid info
                setMaidInfo(response.data.helperInfo[0]); // Adjust based on your API's structure
            } catch (error) {
                console.error("Error fetching maid info:", error);
                // Handle error (e.g., show an error message to the user)
            }
        };

        const fetchSchedule = async () => {
            try {
              const startDate = moment().startOf('month').format('YYYY-MM-DD'); // Get the first day of the current month
              const endDate = moment().endOf('month').format('YYYY-MM-DD'); // Get the last day of the current month
              let allSchedules = [];
      
              // Loop through each day of the month
              for (let day = moment(startDate); day <= moment(endDate); day.add(1, 'days')) {
                const formattedDate = day.format('YYYY-MM-DD');
      
                // Call API for each day
                const scheduleResponse = await axios.get(`/admin/timeOffs/detailSchedule/${id}/${formattedDate}`);
      
                // Map schedule data with formatted date
                const mappedScheduleData = scheduleResponse.data.busyDateList.map(item => ({
                  day: moment(item.dateOff).format('dd').toLowerCase(), // Get the day name in lowercase
                  date: moment(item.dateOff).format('YYYY-MM-DD'), // Get the date in YYYY-MM-DD format
                  startTime: item.startTime,
                  endTime: item.endTime
                }));
      
                // Push mapped schedule data to allSchedules array
                allSchedules.push(...mappedScheduleData);
              }
      
              // Update schedule data in the state
              setScheduleData(allSchedules);
            } catch (error) {
              console.error("Error fetching schedule:", error);
              // Handle error (e.g., show an error message to the user)
            }
          };

        fetchMaidInfo();
        fetchSchedule();
        setLoading(false)

    }, [id]);

    if (loading) {
        return <div>Loading...</div>; // Or a loading spinner
    }

    if (!maidInfo) {
        return <div>Error loading maid data.</div>; // Or an error message
    }

    // Prepare table data based on scheduleData
    const prepareTableData = () => {
        const firstDayOfMonth = moment().startOf('month');
        const lastDayOfMonth = moment().endOf('month');
        const tableData = [];
    
        let weekData = {};
        let day = moment(firstDayOfMonth);
    
        while (day <= lastDayOfMonth) {
          const dayOfWeek = day.format('ddd').toLowerCase();
          const formattedDate = day.format('YYYY-MM-DD');
    
          weekData[dayOfWeek] = formattedDate;
    
          if (dayOfWeek === 'sat') {
            tableData.push({ ...weekData });
            weekData = {};
          }
    
          day.add(1, 'day');
        }
    
        if (Object.keys(weekData).length > 0) {
          tableData.push({ ...weekData });
        }
    
        // Loop through each day of month
        for (let i = 0; i < tableData.length; i++) {
          const item = tableData[i];
    
          // Loop through each day of week
          for (const dayOfWeek in item) {
            const formattedDate = item[dayOfWeek];
    
            // Check if formattedDate matches any date in scheduleData
            const matchingSchedule = scheduleData.find(scheduleItem => moment(scheduleItem.date).format('YYYY-MM-DD') === formattedDate);
    
            if (matchingSchedule) {
              item[dayOfWeek] = moment(formattedDate).format('DD/MM') + ' (Bận)';
            } else {
              item[dayOfWeek] = moment(formattedDate).format('DD/MM');
            }
          }
        }
    
        return tableData;
      };
    
      const tableData = prepareTableData();

      // Handle the case where maidInfo.workingArea is an object
      const renderWorkingArea = () => {
        if (typeof maidInfo.workingArea === 'string') {
          return maidInfo.workingArea; // It's a simple string, render directly
        } else if (typeof maidInfo.workingArea === 'object' && maidInfo.workingArea !== null) {
          // Assuming workingArea has a structure like { province: "...", districts: [...] }
          return `${maidInfo.workingArea.province}, ${maidInfo.workingArea.districts ? maidInfo.workingArea.districts.join(', ') : ''}`;
        } else {
          return 'N/A'; // Handle cases where workingArea is null or undefined
        }
      };

    return (
        <div style={{ padding: 24 }}>
            <Title level={5}>
                Thông tin chi tiết lịch bận của người giúp việc:
            </Title>
            <Card title="Thông tin người giúp việc">
                <Descriptions bordered>
                    <Descriptions.Item label="CMND/CCCD">{maidInfo.helper_id}</Descriptions.Item>
                    <Descriptions.Item label="Họ Tên">{maidInfo.fullName}</Descriptions.Item>
                    <Descriptions.Item label="Ngày Sinh">{moment(maidInfo.birthDate).format('YYYY-MM-DD')}</Descriptions.Item>
                    <Descriptions.Item label="Số ĐT">{maidInfo.phone}</Descriptions.Item>
                    <Descriptions.Item label="Khu Vực Làm Việc">{renderWorkingArea()}</Descriptions.Item>
                </Descriptions>
            </Card>

            <Card title="Lịch Bận">
                <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
                    <div
                        style={{
                            width: 20,
                            height: 20,
                            backgroundColor: "#10CE80",
                            marginRight: 8,
                        }}
                    />
                    <span style={{fontSize: "12px"}}>Ngày rảnh</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
                    <div
                        style={{
                            width: 20,
                            height: 20,
                            backgroundColor: "#FF4D4F",
                            marginRight: 8,
                        }}
                    />
                    <span style={{fontSize: "12px"}}>Ngày có khung giờ bận</span>
                </div>
                <p style={{fontSize: "12px"}}>* Nhấp vào từng ngày để coi chi tiết thông tin bận</p>

                <Table
                    columns={[
                        { title: "Sun", dataIndex: "sun" },
                        { title: "Mon", dataIndex: "mon" },
                        { title: "Tue", dataIndex: "tue" },
                        { title: "Wed", dataIndex: "wed" },
                        { title: "Thu", dataIndex: "thu" },
                        { title: "Fri", dataIndex: "fri" },
                        { title: "Sat", dataIndex: "sat" },
                    ]}
                    dataSource={tableData}
                    pagination={false}
                />
            </Card>
        </div>
    );
};

export default StaffBusySchedule;