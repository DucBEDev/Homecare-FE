import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Card, Descriptions, Table, Button, Typography } from "antd";
import "../../StylePage/styleProcessingDetail.css";
import axios from "axios";

const { Title } = Typography;

const ShowProcessingDetail = () => {
  const location = useLocation();
  const { id } = location.state || {};
  const [orderData, setOrderData] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  const columns = [
    { title: "Giờ Bắt Đầu", dataIndex: "gioBatDau", key: "gioBatDau" },
    { title: "Giờ Kết Thúc", dataIndex: "gioKetThuc", key: "gioKetThuc" },
    { title: "Ngày Làm", dataIndex: "ngayLam", key: "ngayLam" },
    {
      title: "Người Giúp Việc",
      dataIndex: "nguoiGiupViec",
      key: "nguoiGiupViec",
    },
    { title: "Trạng Thái", dataIndex: "trangThai", key: "trangThai" },
    {
      title: "Xử Lý",
      key: "xuLy",
      render: (_, record) => (
        console.log({ record }),
        (
          <>
            <Button type="primary" size="small" style={{ marginRight: 8 }}>
              Sửa
            </Button>

            {record.haveHelper ? (
              <>
                <Button size="small" style={{ marginRight: 8 }}>
                  Đổi NGV
                </Button>
                <Button type="primary" size="small" style={{ marginRight: 8 }}>
                  Hoàn Thành
                </Button>
              </>
            ): (
              <Button danger size="small">
                Giao việc
              </Button>
            )
          }

            <Button danger size="small">
              Xóa
            </Button>
          </>
        )
      ),
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/admin/requests/detail/${id}`
        );
        const { data } = response;
        let requestType =
          data.requestType === "shortTerm" ? "Ngắn hạn" : "Dài hạn";
        let statusNow = "";
        if (data.request.status === "notDone") {
          statusNow = "Chưa tiến hành";
        } else if (data.request.status === "assigned") {
          statusNow = "Chưa tiến hành (Đã giao việc)";
        } else if (data.request.status === "unconfirmed") {
          statusNow = "Chờ xác nhận";
        } else if (data.request.status === "processing") {
          statusNow = "Đang tiến hành";
        } else {
          statusNow = "Đã hoàn thành";
        }
        setOrderData({
          maSoDonHang: data.request._id,
          loaiYeuCau: requestType,
          hoTenKhachHang: data.request.customerInfo.fullName,
          soDTKhachHang: data.request.customerInfo.phone,
          loaiDichVu: [data.request.service_id],
          diaChiYeuCau: `${data.request.location.province}, ${data.request.location.district}`,
          ngayDatYeuCau: new Date(data.request.orderDate).toLocaleDateString(
            "vi-VN"
          ),
          trangThai: statusNow,
          chiPhiCoBan: `${data.objectRequestCost.baseCost.toLocaleString()} VND`,
          chiPhiNgoaiGio: `${data.objectRequestCost.negotiationCosts.toLocaleString()} VND`,
          tongChiPhi: `${(
            data.objectRequestCost.baseCost +
            data.objectRequestCost.negotiationCosts
          ).toLocaleString()} VND`,
        });

        setTimeSlots(
          data.helpers.map((helper, index) => ({
            key: index.toString(),
            gioBatDau: new Date(data.request.startTime).toLocaleTimeString(
              "vi-VN",
              { hour: "2-digit", minute: "2-digit" }
            ),
            gioKetThuc: new Date(data.request.endTime).toLocaleTimeString(
              "vi-VN",
              { hour: "2-digit", minute: "2-digit" }
            ),
            ngayLam: new Date(data.request.startTime).toLocaleDateString(
              "vi-VN",
              {
                weekday: "long",
                year: "numeric",
                month: "numeric",
                day: "numeric",
              }
            ),
            nguoiGiupViec: helper.fullName, // Assuming this is the helper's ID

            trangThai: helper.status,

            //truyền thêm dữ liệu để check đk cho column là đã có ngv hay chưa
            haveHelper: helper.fullName ? true : false,
          }))
        );

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  return (
    <div style={{ padding: 24 }}>
      <Title className="title-processing-detail" level={5}>
        Chi tiết đơn hàng chưa hoàn thành:
      </Title>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <Card title="Thông tin đơn hàng:" style={{ marginBottom: 24 }}>
            <Descriptions bordered>
              <Descriptions.Item label="Mã Số Đơn Hàng">
                {orderData.maSoDonHang}
              </Descriptions.Item>
              <Descriptions.Item label="Loại Yêu Cầu">
                {orderData.loaiYeuCau}
              </Descriptions.Item>
              <Descriptions.Item label="Họ Tên Khách Hàng">
                {orderData.hoTenKhachHang}
              </Descriptions.Item>
              <Descriptions.Item label="Số ĐT Khách Hàng">
                {orderData.soDTKhachHang}
              </Descriptions.Item>
              <Descriptions.Item label="Loại Dịch Vụ">
                {orderData.loaiDichVu.join(", ")}
              </Descriptions.Item>
              <Descriptions.Item label="Địa Chỉ Yêu Cầu">
                {orderData.diaChiYeuCau}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày Đặt Yêu Cầu">
                {orderData.ngayDatYeuCau}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng Thái">
                {orderData.trangThai}
              </Descriptions.Item>
              <Descriptions.Item label="Chi Phí Cơ Bản">
                {orderData.chiPhiCoBan}
              </Descriptions.Item>
              <Descriptions.Item label="Chi Phí Ngoài Giờ">
                {orderData.chiPhiNgoaiGio}
              </Descriptions.Item>
              <Descriptions.Item label="Tổng Chi Phí">
                {orderData.tongChiPhi}
              </Descriptions.Item>
            </Descriptions>
          </Card>
          <Card title="Thông tin chi tiết khung giờ của đơn hàng">
            <Table
              columns={columns}
              dataSource={timeSlots}
              pagination={false}
            />
          </Card>
        </>
      )}
    </div>
  );
};

export default ShowProcessingDetail;
