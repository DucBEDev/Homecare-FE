import React, { useEffect, useState } from "react";
import { Card, Row, Col, Table } from "antd";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";
import "./Dashboard.css"; // Import file CSS

const Dashboard = () => {
  // State lưu trữ dữ liệu dashboard
  const [dashboardData, setDashboardData] = useState({
    kpiDashboard: [], // Dữ liệu cho các biểu đồ KPI chính
    kpiList: [],     // Dữ liệu cho bảng danh sách KPI
  });

  // **GHI NHỚ: useEffect này sẽ fetch API để lấy dữ liệu cho dashboard khi component được mount (render lần đầu)**
  useEffect(() => {
    const fetchData = async () => {
      try {
        // **GHI NHỚ: Thay đổi URL API ở đây thành endpoint thực tế của bạn**
        // const response = await axios.get(
        //   `${process.env.REACT_APP_API_URL}admin/dashboard`
        // );
        // **GHI NHỚ: Xóa comment ở dòng trên và comment 2 dòng dưới khi bạn đã có API thực tế**
        const response = { data: dummyDashboardData }; // Sử dụng dummy data trong lúc phát triển
        console.log("Du lieu tra ve:", response.data);
        setDashboardData(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu dashboard:", error);
      }
    };
    fetchData();
  }, []);

  // Màu sắc cho biểu đồ tròn
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  // Hàm vẽ biểu đồ đồng hồ đo (gauge chart)
  const renderGaugeChart = (value) => {
    const data = [
      { name: "Group A", value: value },
      { name: "Group B", value: 100 - value },
    ];
    return (
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            startAngle={180}
            endAngle={0}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={index === 0 ? "#67b7dc" : "#e9e9e9"} // Màu xanh cho phần trăm, xám cho phần còn lại
              />
            ))}
          </Pie>
          <Tooltip />
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            style={{ fontSize: "1.2rem", fontWeight: "bold" }}
          >
            {`${value}%`} {/* Hiển thị giá trị phần trăm */}
          </text>
        </PieChart>
      </ResponsiveContainer>
    );
  };

  // Hàm vẽ biểu đồ cột (bar chart) - ở đây dùng AreaChart để giống với ảnh mẫu
  const renderBarChart = (data) => {
    return (
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" stroke="#8884d8"/>
          <YAxis stroke="#8884d8"/>
          <Tooltip wrapperStyle={{ backgroundColor: '#8884d8', border: 'none', borderRadius: '5px', color: '#fff' }}/>
          <Area
            type="monotone"
            dataKey="uv"
            stackId="1"
            stroke="#efb765"
            fill="#efb765"
          />
          <Area
            type="monotone"
            dataKey="pv"
            stackId="1"
            stroke="#78d598"
            fill="#78d598"
          />
          <Area
            type="monotone"
            dataKey="amt"
            stackId="1"
            stroke="#8884d8"
            fill="#8884d8"
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  // Hàm vẽ biểu đồ tròn (pie chart)
  const renderPieChart = (data) => {
    return (
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip wrapperStyle={{ backgroundColor: '#8884d8', border: 'none', borderRadius: '5px', color: '#fff' }}/>
        </PieChart>
      </ResponsiveContainer>
    );
  };

  // Cấu hình các cột cho bảng KPI
  const kpiColumns = [
    {
      title: "Mã",
      dataIndex: "code",
      key: "code",
      className: 'column-code',
    },
    {
      title: "Tên KPI",
      dataIndex: "name",
      key: "name",
      className: 'column-name',
    },
    {
      title: "Mục tiêu",
      dataIndex: "target",
      key: "target",
      className: 'column-target',
    },
    {
      title: "Thực tế",
      dataIndex: "actual",
      key: "actual",
      className: 'column-actual',
    },
    {
      title: "Biểu đồ",
      dataIndex: "graph",
      key: "graph",
      className: 'column-graph',
      render: (graphData) => renderBarChart(graphData),
    },
    {
      title: "Hiệu suất",
      dataIndex: "performance",
      key: "performance",
      className: 'column-performance',
      render: (value) => `${value}%`,
    },
  ];

  //   // Dữ liệu giả lập (dummy data)
  const dummyDashboardData = {
    kpiDashboard: [
      { value: 72.74, data: [] }, // Dữ liệu cho biểu đồ gauge thứ nhất
      {
        value: 0,
        data: [
          { name: "Tháng 1", uv: 80, pv: 24, amt: 24 },
          { name: "Tháng 2", uv: 70, pv: 13, amt: 22 },
          { name: "Tháng 3", uv: 65, pv: 98, amt: 22 },
          { name: "Tháng 4", uv: 57, pv: 39, amt: 20 },
          { name: "Tháng 5", uv: 48, pv: 48, amt: 21 },
          { name: "Tháng 6", uv: 33, pv: 38, amt: 25 },
          { name: "Tháng 7", uv: 14, pv: 43, amt: 21 },
        ],
      }, // Dữ liệu cho biểu đồ cột
      { value: 75.32, data: [] }, // Dữ liệu cho biểu đồ gauge thứ hai
      {
        description: "Nhân viên nghỉ nhiều",
        data: [
          { name: "Nhóm A", value: 40 },
          { name: "Nhóm B", value: 30 },
          { name: "Nhóm C", value: 15 },
          { name: "Nhóm D", value: 15 },
        ],
      }, // Dữ liệu cho biểu đồ tròn
    ],
    kpiList: [
      {
        code: 23,
        name: "Dọn nhà",
        target: 4,
        actual: 4,
        graph: [
          { name: "Trang A", uv: 40, pv: 24, amt: 24 },
          { name: "Trang B", uv: 30, pv: 13, amt: 22 },
        ],
        performance: 85.32,
      },
      {
        code: 24,
        name: "Chăm sóc người già",
        target: 5,
        actual: 4,
        graph: [
          { name: "Trang C", uv: 20, pv: 98, amt: 22 },
          { name: "Trang D", uv: 27, pv: 39, amt: 20 },
        ],
        performance: 84.00,
      },
    ],
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">
        Các Chỉ Số Hiệu Suất Chính (KPIs)
      </h1>
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card className="dashboard-card">
            {/* **GHI NHỚ: Kiểm tra xem có dữ liệu cho biểu đồ gauge đầu tiên không trước khi render** */}
            {dashboardData.kpiDashboard[0] &&
              renderGaugeChart(dashboardData.kpiDashboard[0].value)}
          </Card>
        </Col>
        <Col span={8}>
          <Card className="dashboard-card">
            {/* **GHI NHỚ: Kiểm tra xem có dữ liệu cho biểu đồ cột không trước khi render** */}
            {dashboardData.kpiDashboard[1] &&
              renderBarChart(dashboardData.kpiDashboard[1].data)}
          </Card>
        </Col>
        <Col span={8}>
          <Card className="dashboard-card">
            {/* **GHI NHỚ: Kiểm tra xem có dữ liệu cho biểu đồ gauge thứ hai không trước khi render** */}
            {dashboardData.kpiDashboard[2] &&
              renderGaugeChart(dashboardData.kpiDashboard[2].value)}
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: "20px" }}>
        <Col span={16}>
          <Card title={<span className="card-title">Danh sách KPIs</span>} className="dashboard-card">
            <Table
              columns={kpiColumns}
              dataSource={dashboardData.kpiList}
              rowKey="code"
              pagination={false}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card className="dashboard-card">
            {/* **GHI NHỚ: Kiểm tra xem có dữ liệu cho biểu đồ tròn không trước khi render** */}
            {dashboardData.kpiDashboard[3] &&
              renderPieChart(dashboardData.kpiDashboard[3].data)}
            <div
              style={{
                textAlign: "center",
                marginTop: "10px",
                color: "red",
                fontWeight: "bold",
              }}
            >
              {/* **GHI NHỚ: Kiểm tra xem có mô tả cho biểu đồ tròn không trước khi render** */}
              {dashboardData.kpiDashboard[3] &&
                dashboardData.kpiDashboard[3].description}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;